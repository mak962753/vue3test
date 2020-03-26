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
    groups: Group[];
}

class Group {
    private readonly objects: THREE.Object3D[];
    private readonly parts: THREE.Object3D[];
    private readonly offsets: THREE.Vector3[];
    private insideMaterials: THREE.MeshStandardMaterial[] = [];
    private cnt1: number = 0;
    private dir1: number = 0;
    private lim1: number = 30;

    constructor(private scene: THREE.Object3D) {
        this.parts = this.scene.children.filter(i => i instanceof THREE.Group);

        let offsets: THREE.Vector3[] = [];
        if (this.parts.length === 4) {
            offsets = [
                new THREE.Vector3(-1, 1, -1.5),
                new THREE.Vector3(1, 1, 1),
                new THREE.Vector3(-1, -0.5, -1.5),
                new THREE.Vector3(1, -1, 1)
            ];
        }
        if (this.parts.length === 3) {
            offsets = [
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(-1, -1, -1)
            ];
        }
        if (this.parts.length === 2) {
            offsets = [
                new THREE.Vector3(1, -1, 0),
                new THREE.Vector3(0, 1, 0),
            ];
        }
        
        this.offsets = offsets.map(i => i.multiplyScalar(0.15));
        
        scene.traverse(i => {
            if (i instanceof THREE.Mesh && i.material instanceof THREE.MeshStandardMaterial) {
                const mat = i.material as THREE.MeshStandardMaterial;
                
                if (isInsideMat(mat.name)) {
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
    
    expand() {
        this.dir1 = 1;
    }

    collapse() {
        this.dir1 = -1;
    }

    animate() {
        this.scene.rotation.y+=0.01;
        rotate(this.scene, YAxis, 0.005);
        
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

    const light = new THREE.PointLight( 0xffffff, 8, 500 );
    light.position.set( 0, -1, 8 );
    scene.add( light );

    // const light1 = new THREE.PointLight( 0xff0000, 10, 500 );
    // light.position.set( 0, -10, 0 );
    // scene.add( light1 );


    //const light2 = new THREE.AmbientLight( 0xff0000, 15 );
    const light2 = new THREE.PointLight( 0xff0000, 100 );
    light2.position.set( -4, -7, 7 );
    scene.add( light2 );
    
    const light3 = new THREE.PointLight( 0x00ff00, 5 );
    light3.position.set( 7, -10, 9 );
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
        groups: new Array<Group>(),
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

    Promise.all([
        loadGlb('assets/scene/Stone1.glb'),
        loadGlb('assets/scene/Stone2.glb'),
        loadGlb('assets/scene/Stone3.glb')
    ]).then( models => {
        const angle = -2 * Math.PI / models.length;
        
        models.forEach((model, index) => {
            const s0 = model.scene;
            s0.name = `scene${index}`;
            s0.traverse(i => {
                const mesh = i instanceof THREE.Mesh ? (i as THREE.Mesh) : null;
                const mat = mesh && mesh.material instanceof THREE.MeshStandardMaterial ? (mesh.material as THREE.MeshStandardMaterial) : null;
                if (mat && !isInsideMat(mat.name)) {
                    //console.log(mat.name)
                    mat.roughness = 1;
                    //mat.metalness = 0.1;
                    //mat.flatShading = true;
                    //mat.map = layer1;
                    // mat.emissiveMap= layer1;
                }
            });
            const a = index * angle;
            const radius = 5;
            const [x,z] = [radius * Math.cos(a), radius * Math.sin(a)];
            
            s0.position.set(x, 0, z);
            
            scene.add( s0 );
            const group = new Group(scene.getObjectByName(s0.name)!);
            that.groups.push(group);
        });
        
        const onMouseClick = (e: MouseEvent) => { onMouse(that, e); };
        renderer.domElement.addEventListener('mousemove', onMouseClick, true);
        disposeFns.push(() => { renderer.domElement.removeEventListener('click', onMouseClick) });

    });
    
    that.camera.position.z = 9;

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

function findIntersection(that: IScene, raycaster: THREE.Raycaster): [Group, THREE.Object3D] | null {
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
       g === group ? g.expand() : g.collapse() 
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