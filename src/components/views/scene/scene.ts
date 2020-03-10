import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
//    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {rotate, YAxis} from './utils';
/**
 * rotate around world axis
 */
interface IScene {
    render(): void;
    dispose(): void;
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;
    groups: Group[];
}

class Group {
    static G1:string = 'Gem_part1001';
    static G2:string = 'Gem_Part2001';
    static G3:string = 'Gem_Part3001';
    static G4:string = 'Gem_Part4001';

    private readonly objects: THREE.Object3D[];
    private ofs1: THREE.Vector3;
    private ofs2: THREE.Vector3;
    private ofs3: THREE.Vector3;
    private ofs4: THREE.Vector3;
    private cnt1: number = 0;
    private dir1: number = 0;
    private lim1: number = 30;

    constructor(private scene: THREE.Object3D) {
        this.ofs1 = new THREE.Vector3(-1,1, -1).multiplyScalar(0.15);
        this.ofs2 = new THREE.Vector3(1,1, 1).multiplyScalar(0.15);
        this.ofs3 = new THREE.Vector3(1,-1, -1).multiplyScalar(0.15);
        this.ofs4 = new THREE.Vector3(1,-1, 1).multiplyScalar(0.15);

        this.objects = [
            ...this.scene.getObjectByName(Group.G1)!.children,
            ...this.scene.getObjectByName(Group.G2)!.children,
            ...this.scene.getObjectByName(Group.G3)!.children,
            ...this.scene.getObjectByName(Group.G4)!.children];
    }

    getIntersected(raycaster: THREE.Raycaster): THREE.Object3D|null {
        const intersects = raycaster.intersectObjects(this.objects, false); //array
        return intersects.length > 0 ? intersects[0].object : null;
    }
    expand() {
        this.dir1 = 1;
    }

    collapse() {
        this.dir1 = -1;
    }

    animate() {
        rotate(this.scene, YAxis, 0.005);
        //this.scene.rotation.y-=0.01;

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
            const g1 = this.scene.getObjectByName(Group.G1)!;
            const g2 = this.scene.getObjectByName(Group.G2)!;
            const g3 = this.scene.getObjectByName(Group.G3)!;
            const g4 = this.scene.getObjectByName(Group.G4)!;

            g1.translateOnAxis(this.ofs1, this.dir1 * 0.1);
            g2.translateOnAxis(this.ofs2, this.dir1 * 0.1);
            g3.translateOnAxis(this.ofs3, this.dir1 * 0.1);
            g4.translateOnAxis(this.ofs4, this.dir1 * 0.1);
        }
    }
}

function init(): IScene {
    let disposed = false;
    const scene = new THREE.Scene();
    const disposeFns: Array<()=>void> = [];

    scene.background = new THREE.Color("#ffffff");

    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer( { antialias: true } );

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.outputEncoding = THREE.sRGBEncoding;
    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    const that = {
        scene,
        camera,
        renderer,
        groups: new Array<Group>(),
        dispose() {
            disposed = true;
            disposeFns.forEach(i=>i());
        },
        render() {
            this.renderer.render(scene, camera);
        }
    };

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('assets/scene/decoder');
    loader.setDRACOLoader(dracoLoader);

    loader.load('assets/scene/Stone.glb', function (gltf: any) {
        const s0 = gltf.scene;
        const s1 = gltf.scene.clone(true);
        const s2 = gltf.scene.clone(true);
        const s3 = gltf.scene.clone(true);

        s0.name = 'Scene0';
        s1.name = 'Scene1';
        s2.name = 'Scene2';
        s3.name = 'Scene3';

        s0.position.set(-5, 0, 0);
        s1.position.set(5, 0, 0);
        s2.position.set(0, 0, -5);
        s3.position.set(0, 0, 5);

        scene.add( s0 );
        scene.add( s1 );
        scene.add( s2 );
        scene.add( s3 );

        that.groups.push(
            new Group(scene.getObjectByName('Scene0')!),
            new Group(scene.getObjectByName('Scene1')!),
            new Group(scene.getObjectByName('Scene2')!),
            new Group(scene.getObjectByName('Scene3')!),
        );

        console.log(scene);

        that.render();
        function onMouseClick(event: MouseEvent) {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera(mouse, that.camera);
            const x = findIntersection(raycaster);
            if (x) {

                for (let i = 0; i < that.groups.length; i++) {
                    if (that.groups[i] === x[0]) {
                        that.groups[i].expand();
                    } else {
                        that.groups[i].collapse();
                    }

                }
            }
        }
        renderer.domElement.addEventListener("mousemove", onMouseClick, true);
        disposeFns.push(() => { renderer.domElement.removeEventListener('click', onMouseClick) });
    }, function progress () {
        console.log('done');
    }, function error (err: any) {
        console.error(err)
    });

    function findIntersection(raycaster: THREE.Raycaster): [Group, THREE.Object3D] | null {
        for (let i = 0; i < that.groups.length; i++) {
            const x = that.groups[i].getIntersected(raycaster);
            if (x) {
                return [that.groups[i], x];
            }
        }
        return null;
    }

    that.camera.position.z = 10;

    that.renderer.setSize( window.innerWidth, window.innerHeight );
    const container = document.getElementById( "view" );
    container!.appendChild( that.renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );
    disposeFns.push(() => {window.removeEventListener( 'resize', onWindowResize ); });

    function animate() {
        if (disposed)
            return;
        that.groups.forEach(i => i.animate());

        that.renderer.render(that.scene, that.camera);

        requestAnimationFrame( animate );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
        that.render();
    }

    // const controls = new OrbitControls( camera, renderer.domElement );
    // controls.addEventListener( 'change', () => that.render() ); // use if there is no animation loop
    // controls.minDistance = 0;
    // controls.maxDistance = 100
    // controls.target.set( 0, 0,  -5 );
    // controls.update();

    requestAnimationFrame(animate);

    return that;
}

export {
    IScene,
    init
}