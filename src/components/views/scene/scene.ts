import * as THREE from 'three';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {rotate, YAxis} from './utils';
//  import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
//  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * rotate around world axis
 */
interface IScene {
    render(): void;
    dispose(): void;
    isDisposed(): boolean;
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    groups: GroupAbstract[];
}

abstract class GroupAbstract {
    abstract animate():void;
    abstract mouseOver():void;
    abstract mouseOut():void;
    abstract getIntersected(raycaster: THREE.Raycaster): THREE.Object3D|null;
}

class GroupLogo extends GroupAbstract {
    constructor(private scene: THREE.Object3D) {
        super();
    }

    animate(): void {
        this.scene.rotation.y -= 0.003;
    }

    getIntersected(raycaster: THREE.Raycaster): THREE.Object3D | null {
        return null;
    }

    mouseOut(): void {
    }

    mouseOver(): void {
    }
}

class GroupStone extends GroupAbstract {
    private readonly objects: THREE.Object3D[];
    private readonly parts: THREE.Object3D[];
    private readonly offsets: THREE.Vector3[];
    private readonly rotationAxis: THREE.Vector3 = new THREE.Vector3();
    private readonly rotationSpeed: number = 0;
    private insideMaterials: THREE.MeshStandardMaterial[] = [];

    private cnt1: number = 0;
    private dir1: number = 0;
    private lim1: number = 30;

    constructor(private scene: THREE.Object3D, startingAngle: number) {
        super();

        this.parts = this.scene.children.filter(i => i instanceof THREE.Group);
        let radius = 6.5;
        let offsets: THREE.Vector3[] = [];
        if (this.parts.length === 4) {
            this.rotationAxis = new THREE.Vector3(-0.1,1,0.3);
            this.rotationSpeed = 0.0085;
            offsets = [
                new THREE.Vector3(-1, 1, -1.5),
                new THREE.Vector3(1, 1, 1),
                new THREE.Vector3(-1, -0.5, -1.5),
                new THREE.Vector3(1, -1, 1)
            ];
        }
        if (this.parts.length === 3) {
            radius = 3;

            this.rotationAxis = new THREE.Vector3(0,1,0);
            this.rotationSpeed = 0.005;

            offsets = [
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(-1, -1, -1)
            ];
        }
        if (this.parts.length === 2) {
            radius = 5;
            this.rotationSpeed = 0.0075;
            this.rotationAxis = new THREE.Vector3(0.1,1,0.3);
            offsets = [
                new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(0, 1, 0),
            ];
        }

        const [x,z] = [radius * Math.cos(startingAngle), radius * Math.sin(startingAngle)];
        this.scene.position.set(x, 1, z);
        this.offsets = offsets.map(i => i.multiplyScalar(0.15));
        
        scene.traverse(i => {
            if (i instanceof THREE.Mesh && i.material instanceof THREE.MeshStandardMaterial) {
                const mat = i.material as THREE.MeshStandardMaterial;
                
                if (isInsideMat(mat.name)) {
                    mat.roughness = 1;
                    mat.map!.repeat = new THREE.Vector2(3,3);
                    //console.log(mat);
                    this.insideMaterials.push(mat);
                }
            }
        });
        
        this.objects = this.parts.reduce((a, i) => {
            return [...a, ...i.children];
        }, [] as THREE.Object3D[]);
    }

    getIntersected(raycaster: THREE.Raycaster): THREE.Object3D|null {
        const intersects = raycaster.intersectObjects(this.objects, false); //array
        return intersects.length > 0 ? intersects[0].object : null;
    }
    
    mouseOver() {
        this.expand();
    }

    mouseOut() {
        this.collapse();
    }

    private expand() {
        this.dir1 = 1;
    }

    private collapse() {
        this.dir1 = -1;
    }

    animate() {
        this.scene.rotation.y+=0.01;
        rotate(this.scene, this.rotationAxis, this.rotationSpeed);
        
        this.insideMaterials.forEach(m => {
            const mm = m as THREE.MeshStandardMaterial;
            mm.map!.rotation += 0.0005; 
        });
        let move = false;

        if ( this.dir1 > 0 && this.cnt1 < this.lim1) {
            this.cnt1++;
            move = true;
        }

        if (this.dir1 < 0 && this.cnt1 > 0) {
            move = true;
            this.cnt1--;
        }

        if (move) {
            this.parts.forEach((g, i) => {
                g.translateOnAxis(this.offsets[i], this.dir1 * 0.1);
            });
        }
    }
}

function init(containerId: string): IScene {
    let disposed = false;
    const scene = new THREE.Scene();
    const disposeFns: Array<()=>void> = [];

//    scene.background = new THREE.Color('#ffffff');
//    const layer1 = new THREE.TextureLoader().load( 'assets/scene/Background.png');
    
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer( { 
        antialias: true ,
        precision: 'lowp', 
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
        powerPreference: 'low-power',
        alpha: true        
        /*depth: false,
        stencil: true,
        */
    } );
    renderer.physicallyCorrectLights = true;

    // const backgroundColor = 0xffffff;
    
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0, 0);/// backgroundColor );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;//THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;//Math.pow( 0.94, 5.0 );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    const light0 = new THREE.AmbientLight( 0x555555, 0.1)//, 50 );
    //light0.position.set( -10, 8, -10 );
    scene.add( light0 );
    const light01 = new THREE.PointLight( 0xaaaaaa, 5, 50 );
    light01.position.set( 10, 8, -10 );
    scene.add( light01 );

    const light = new THREE.PointLight( 0xccccaa, 20, 40 );
    light.position.set( -10, -10, 20 );
    scene.add( light );

    // const light1 = new THREE.PointLight( 0xff0000, 10, 500 );
    // light.position.set( 0, -10, 0 );
    // scene.add( light1 );


    //const light2 = new THREE.AmbientLight( 0xff0000, 15 );
    const light2 = new THREE.PointLight( 0xfe19c1, 10 );
    light2.position.set( 5, -10, 5 );
    scene.add( light2 );
    
    const light3 = new THREE.PointLight( 0x119960, 10 );
    light3.position.set( -5, -5, 5 );
    scene.add( light3 );
    
    // scene.background = layer1;
    
    // const light = new THREE.AmbientLight( 0xffffff , 1); // soft white light
    // scene.add( light );

    // createModel();
    // function createModel() {
    //     //const geometry = new THREE.SphereGeometry( 1, 60, 40 );
    //     const geometry = new THREE.SphereBufferGeometry( 0.4, 10, 10 );
    //
    //     const material = new THREE.MeshStandardMaterial ( {
    //         //map: layer1
    //     });
    //     const mesh = new THREE.Mesh( geometry, material );
    //     //mesh.scale.set( -1, -1, -1 ); // important step!
    //     mesh.position.set( 0, -2, 3 ); // important step!
    //     scene.add( mesh );
    // }
    const that = {
        scene,
        camera,
        renderer,
        groups: new Array<GroupAbstract>(),
        isDisposed() {
            return disposed;
        },
        dispose() {
            disposed = true;
            disposeFns.forEach(i=>i());
            scene.dispose();
        },
        render() {
            this.renderer.render(scene, camera);
        },
    };

    function initStones(models: GLTF[]) {
        const angle = -2 * Math.PI / models.length;

        models.forEach((model, index) => {
            const s0 = model.scene;
            s0.name = `scene${index}`;
            s0.traverse(i => {
                const mesh = i instanceof THREE.Mesh ? (i as THREE.Mesh) : null;
                const mat = mesh && mesh.material instanceof THREE.MeshStandardMaterial ? (mesh.material as THREE.MeshStandardMaterial) : null;
                if (mat && !isInsideMat(mat.name)) {
                    //console.log(mat.name)
                    mat.roughness = .8;
                    //mat.metalness = 0.1;
                    //mat.flatShading = true;
                    //mat.map = layer1;
                    // mat.emissiveMap= layer1;
                }
            });
            const startingAngle = index * angle;
            scene.add( s0 );
            const group = new GroupStone(scene.getObjectByName(s0.name)!, startingAngle);
            that.groups.push(group);
        });

        const onMouseClick = (e: MouseEvent) => { onMouse(that, e); };
        renderer.domElement.addEventListener('mousemove', onMouseClick, true);
        disposeFns.push(() => { renderer.domElement.removeEventListener('click', onMouseClick) });
    }

    Promise.all([
        Promise.all([
            loadGlb('assets/scene/Stone1.glb'),
            loadGlb('assets/scene/Stone2.glb'),
            loadGlb('assets/scene/Stone3.glb')
        ]),
        loadGlb('assets/scene/LOGO.glb')
    ]).then( ([models, logo]) => {
        initStones(models);

        scene.add(logo.scene);
        logo.scene.position.set(0, 1, 0);
        that.groups.push(new GroupLogo(logo.scene));
    });
    
    that.camera.position.z = 11;

    that.renderer.setSize( window.innerWidth, window.innerHeight );
    
    const container = document.getElementById( containerId );
    
    container!.appendChild( that.renderer.domElement );
    
    window.addEventListener( 'resize', onWindowResize, false );
    
    disposeFns.push(() => {window.removeEventListener( 'resize', onWindowResize ); });

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        that.render();
    }

    animate(that);

    return that;
}

function findIntersection(that: IScene, raycaster: THREE.Raycaster): [GroupAbstract, THREE.Object3D] | null {
    for (let i = 0; i < that.groups.length; i++) {
        const x = that.groups[i].getIntersected(raycaster);
        if (x) {
            return [that.groups[i], x];
        }
    }
    return null;
}

function onMouse(that: IScene, event: MouseEvent) {
    const {renderer: {domElement : {clientHeight, clientWidth}}, camera} = that;
    const caster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY /clientHeight ) * 2 + 1;
    caster.setFromCamera(mouse, camera);
    const [group,] = findIntersection(that, caster) || [];
    if (!group) 
        return;
    that.groups.forEach(g => {
       g === group ? g.mouseOver() : g.mouseOut()
    });
}

function animate(that: IScene) {
    if (that.isDisposed())
        return;
    that.groups.forEach(i => i.animate());
    that.renderer.render(that.scene, that.camera);
    requestAnimationFrame( animate.bind(null, that) );
}

function loadGlb(url: string): Promise<GLTF> {
    return new Promise((ok, err) => {
        const loader = new GLTFLoader();
        loader.load(url, (gltf: GLTF) => {
            ok(gltf);
        }, (/*progressEvent: ProgressEvent*/) => {
            
        }, (errorEvent: ErrorEvent) => {
            err(errorEvent);
        });
    });
}
function isInsideMat(name: string): boolean {
    return !!name.match(/stone\d?_inside_mat/i);
}
export {
    IScene,
    init
}