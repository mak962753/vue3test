import * as THREE from 'three';
import {Group} from './group'
import {GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import {GroupLogo} from "./group-logo";
import {GroupStone} from "./group-stone";
import {isInsideMat, loadGlb} from "./utils";
import {Commands} from "./commands";
import TWEEN from '@tweenjs/tween.js'


/**
 * rotate around world axis
 */
interface IScene {
    init(): Promise<any>;
    dispose(): void;
}

class StoneScene implements IScene {
    private disposed: boolean = false;
    private disposeFns: (()=>void)[] = [];
    private readonly renderer: THREE.Renderer;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly scene: THREE.Scene;
    private groups: Group[] = [];
    private isInteractive: boolean = true;
    private activeGroup: Group | null = null;
    private resetTimeout: number = -1;

    constructor(
        private containerId: string
    ) {
        this.scene = new THREE.Scene();
        this.camera = initCamera();
        this.renderer = this.initRenderer(containerId);

        this.initLighting();
    }
    init() {
        return loadModels().then(([models, logo]) => {
            const groups = initStones(models, this.scene, this.containerId, this.camera);
            const logoGroup = initLogo(logo, this.scene);
            this.groups.push(...groups, logoGroup);
        }).then(() => {
            const onHover = (e: MouseEvent) => this.onHover(e);
            this.renderer.domElement.addEventListener('mousemove', onHover, true);
            this.disposeFns.push(() => this.renderer.domElement.removeEventListener('mousemove', onHover) );

            const onInteract = (e: MouseEvent) => this.onActivate(e);
            this.renderer.domElement.addEventListener('click', onInteract, true);
            this.disposeFns.push(() => this.renderer.domElement.removeEventListener('click', onInteract));

        }).then(() => {
            this.animate();
        });
    }

    dispose(): void {
        if (this.disposed)
            return;
        this.disposed = true;
        this.disposeFns.forEach(i=>i());
        this.scene.dispose();
    }

    private initRenderer(containerId: string): THREE.Renderer {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            precision: 'lowp',
            preserveDrawingBuffer: true,
            premultipliedAlpha: false,
            powerPreference: 'low-power',
            alpha: true
        });

        renderer.physicallyCorrectLights = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0, 0);/// backgroundColor );
        renderer.toneMapping = THREE.ACESFilmicToneMapping;//THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;//Math.pow( 0.94, 5.0 );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.setSize( window.innerWidth, window.innerHeight);

        const onWindowResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.render();
        };
        window.addEventListener( 'resize', onWindowResize, false );
        this.disposeFns.push(() => {window.removeEventListener( 'resize', onWindowResize ); });
        const container = document.getElementById( containerId );
        container!.appendChild( renderer.domElement );
        return renderer;
    }

    private initLighting () {
        const light0 = new THREE.AmbientLight(0x555555, 0.1);//, 50 );
        //light0.position.set( -10, 8, -10 );
        this.scene.add(light0);
        const light01 = new THREE.PointLight(0xaaaaaa, 5, 50);
        light01.position.set(10, 8, -10);
        this.scene.add(light01);

        const light = new THREE.PointLight(0xccccaa, 20, 40);
        light.position.set(-10, -10, 20);
        this.scene.add(light);

        const light2 = new THREE.PointLight(0xfe19c1, 10);
        light2.position.set(5, -10, 5);
        this.scene.add(light2);

        const light3 = new THREE.PointLight(0x119960, 10);
        light3.position.set(-5, -5, 5);
        this.scene.add(light3);
    }

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    private animate() {
        if (this.disposed)
            return;
        TWEEN.update();
        this.groups.forEach(i => i.animate());
        this.render();
        requestAnimationFrame(() => this.animate() );
    }

    private findIntersection(rayCaster: THREE.Raycaster): [Group, THREE.Object3D] | null {
        for (let i = 0; i < this.groups.length; i++) {
            const x = this.groups[i].getIntersected(rayCaster);
            if (x) {
                return [this.groups[i], x];
            }
        }
        return null;
    }

    private groupFromMouseEvent(event: MouseEvent): Group | null {
        const {domElement : {clientHeight, clientWidth}} = this.renderer;
        const caster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = ( event.clientX / clientWidth ) * 2 - 1;
        mouse.y = - ( event.clientY /clientHeight ) * 2 + 1;
        caster.setFromCamera(mouse, this.camera);
        const [group,] = this.findIntersection(caster) || [];
        return group ? group : null;
    }

    private onHover(event: MouseEvent) {
        if (!this.isInteractive)
            return;

        const group = this.groupFromMouseEvent(event);
        if (!group || group === this.activeGroup)
            return;

        this.groups
            .filter(i => i !== this.activeGroup)
            .forEach(i => i === group ? group.runAction('expand') : i.runAction('collapse'));

    }

    private async  onActivate(event: MouseEvent) {
        if (!this.isInteractive)
            return;

        clearTimeout(this.resetTimeout);

        const group = this.groupFromMouseEvent(event);

        if (!group || group === this.activeGroup)
            return;

        this.isInteractive = false;


        if (this.activeGroup) {
            await Promise.all([
                this.activeGroup.runAction(Commands.deactivate, true),
                group.runAction(Commands.activate_from_bg)
            ]);
        } else {
            let index = -1;
            const inactiveItems = this.groups.filter(i => i !== group);
            const jobs = inactiveItems.map((i, j) => {
                index = i === group || i instanceof GroupLogo ? index : index + 1;
                return i.runAction(Commands.move_into_bg, index);
            });
            await Promise.all([
                ...jobs,
                group.runAction(Commands.activate_from_fg),
                group.runAction(Commands.into_center)
            ]);
        }

        this.activeGroup = group;
        this.isInteractive = true;

        this.resetTimeout = window.setTimeout(() => {
            this.isInteractive = false;
            if (!this.activeGroup)
                return;

            const inactiveItems = this.groups.filter(i => i !== this.activeGroup);
            const jobs = [
                this.activeGroup.runAction(Commands.deactivate, false),
                ...inactiveItems.map(i => i.runAction(Commands.move_from_bg))
            ];
            Promise.all(jobs).then(() => {
                this.activeGroup = null;
                this.isInteractive = true;
            });
        }, 5000);

    }
}

function loadModels(): Promise<[GLTF[], GLTF]> {
    return Promise.all([
        Promise.all([
            loadGlb('assets/scene/Stone1.glb'),
            loadGlb('assets/scene/Stone2.glb'),
            loadGlb('assets/scene/Stone3.glb')
        ]),
        loadGlb('assets/scene/LOGO.glb')
    ]);
}

function initCamera(): THREE.PerspectiveCamera  {
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 11;
    return camera;
}

function initLogo(model: GLTF, scene: THREE.Scene): Group {
    const pivot = new THREE.Object3D();
    pivot.add(model.scene);
    scene.add(pivot);
    model.scene.position.set(0, 1, 0);
    return new GroupLogo(model.scene);
}

function initStones(models: GLTF[], scene: THREE.Scene, containerId: string, cam: THREE.PerspectiveCamera): Group[] {
    const angle = 2 * Math.PI / models.length;

    return models.map((model, index) => {
        const s0 = model.scene;
        s0.name = `scene${index}`;
        s0.traverse(i => {
            const mesh = i instanceof THREE.Mesh ? (i as THREE.Mesh) : null;
            const mat = mesh && mesh.material instanceof THREE.MeshStandardMaterial ? (mesh.material as THREE.MeshStandardMaterial) : null;
            if (mat && !isInsideMat(mat.name)) {
                mat.roughness = .8;
            }
        });
        const startingAngle = index * angle;
        const pivot = new THREE.Object3D();
        pivot.position.set(0,0,0);
        pivot.rotation.set(0,0,0);
        pivot.add(s0);
        scene.add( pivot );
        return (new GroupStone(s0, startingAngle, containerId, cam)) as Group;
    });
}

function init(containerId: string): IScene {
    return new StoneScene(containerId);
}

export {
    IScene,
    init
}