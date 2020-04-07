import {Group} from "./group";
import * as THREE from "three";
import {IAnimation} from "./animation";
import {AnimationCollapseExpand} from "./animation-collapse-expand";
import {AnimationRotate} from "./animation-rotate";
import {isInsideMat} from "./utils";

interface StoneGroupParams {
    offsets: THREE.Vector3[];
    rotationAxis: THREE.Vector3;
    rotationSpeed: number;
    rotationRadius: number;
    centerLocalRotationAngles: THREE.Vector3,
    centerGlobalRotationAngle: number
}

const Stone2Params: StoneGroupParams = {
    offsets: [
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(0, 1, 0)
    ],
    rotationAxis: new THREE.Vector3(0.1, 1, 0.3),
    rotationSpeed: 0.0075,
    rotationRadius: 5,
    centerLocalRotationAngles: new THREE.Vector3(0, Math.PI, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2
};

const Stone3Params: StoneGroupParams = {
    offsets: [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(-1, -1, -1)
    ],
    rotationAxis: new THREE.Vector3(0, 1, 0),
    rotationSpeed: 0.005,
    rotationRadius: 3,
    centerLocalRotationAngles: new THREE.Vector3(0, Math.PI, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2
};

const Stone4Params: StoneGroupParams = {
    offsets: [
        new THREE.Vector3(-1, 1, -1.5),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, -0.5, -1.5),
        new THREE.Vector3(1, -1, 1)
    ],
    rotationAxis: new THREE.Vector3(-0.1, 1, 0.3),
    rotationSpeed: 0.0085,
    rotationRadius: 6.5,
    centerLocalRotationAngles: new THREE.Vector3(0, Math.PI / 2, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2
};
function getStoneParams(objectCount: number): StoneGroupParams {
    switch (objectCount) {
        case 2: return Stone2Params;
        case 3: return Stone3Params;
        case 4: return Stone4Params;
    }
    throw new Error('Unsupported Stone object count');
}

export class GroupStone extends Group {
    private readonly objects: THREE.Object3D[];
    private readonly parts: THREE.Object3D[];

    private insideMaterials: THREE.MeshStandardMaterial[] = [];

    private animations: IAnimation[] = [];

    private readonly expandAnimation: AnimationCollapseExpand;
    private readonly rotateAnimation: AnimationRotate;
    private readonly params: StoneGroupParams;
    private domItems: HTMLElement[] = [];

    constructor(private scene: THREE.Object3D,
                startingAngle: number,
                private containerId: string,
                private camera: THREE.PerspectiveCamera) {
        super();

        this.parts = this.scene.children.filter(i => i instanceof THREE.Group);

        scene.traverse(i => {
            if (i instanceof THREE.Mesh && i.material instanceof THREE.MeshStandardMaterial) {
                const mat = i.material as THREE.MeshStandardMaterial;

                if (isInsideMat(mat.name)) {
                    mat.roughness = 1;
                    mat.map!.repeat = new THREE.Vector2(3, 3);
                    //console.log(mat);
                    this.insideMaterials.push(mat);
                }
            }
        });

        this.params = getStoneParams(this.parts.length);
        const {rotationRadius: radius, offsets, rotationAxis, rotationSpeed} = this.params;
        const [x, z] = [radius * Math.cos(0), radius * Math.sin(0)];
        this.scene.position.set(x, 1, z);

        this.expandAnimation = new AnimationCollapseExpand(this.parts, offsets.map(i => i.multiplyScalar(0.15)));
        this.rotateAnimation = new AnimationRotate(startingAngle, rotationSpeed, rotationAxis.normalize(), scene);
        this.animations.push(this.rotateAnimation);
        this.animations.push(this.expandAnimation);

        this.objects = this.parts.reduce((a, i) => {
            return [...a, ...i.children];
        }, [] as THREE.Object3D[]);
    }

    getIntersected(raycaster: THREE.Raycaster): THREE.Object3D | null {
        const intersects = raycaster.intersectObjects(this.objects, false); //array
        return intersects.length > 0 ? intersects[0].object : null;
    }

    async activate(): Promise<any> {
        this.expandAnimation.expand();

        await this.rotateAnimation.setModeRotateTo(
            this.params.centerGlobalRotationAngle,
            this.params.centerLocalRotationAngles);

        const container = document.getElementById(this.containerId);
        const box = new THREE.Box3().setFromObject(this.scene);
        const rect = container!.getBoundingClientRect();
        function createDiv(itemTitle: string, itemText: string , styles: {k: any, v: string}[]) {
            const i = document.createElement('div');
            i.className = "menu-item";
            styles.forEach(({k,v}) => {
                i.style[k] = v;
            });
            const icon = document.createElement('div');
            icon.className = "menu-item__icon";
            const text = document.createElement('div');
            const title = document.createElement('h1');
            text.className = "menu-item__text";
            i.appendChild(icon);
            i.appendChild(text);
            text.appendChild(title);
            title.appendChild(document.createTextNode(itemTitle));
            text.appendChild(document.createTextNode(itemText));
            container!.appendChild(i);
            return i;
        }
        // const pos1 = this.toScreenXY(box.min, rect.width, rect.height);
        // const pos2 = this.toScreenXY(box.max, rect.width, rect.height);
        const Text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        switch(this.scene.children.length) {
            case 4:
                this.domItems.push(createDiv('Football', Text, [{k: 'top', v: `50%`}, {k: 'right', v: `60%`}]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `50%`}, {k: 'left', v: `60%`}]));
                this.domItems.push(createDiv('Football', Text, [{k: 'top', v: `75%`}, {k: 'right', v: `60%`}]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `75%`}, {k: 'left', v: `60%`}]));
                break;
            case 3:
                this.domItems.push(createDiv('Football', Text,[{k: 'top',  v: `15%`}, {k: 'left', v: `50%`}, {k: 'transform', v: 'translateX(-50%)'} ]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `45%`}, {k: 'right', v: `57%`}]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `45%`}, {k: 'left', v: `57%`}]));
break;
            case 2:
                this.domItems.push(createDiv('Football', Text,[{k: 'top',  v: `21%`}, {k: 'left', v: `50%`}, {k: 'transform', v: 'translateX(-50%)'} ]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top',  v: `65%`}, {k: 'left', v: `50%`}, {k: 'transform', v: 'translateX(-50%)'} ]));
break;
        }

        //await this.rotateAnimation.setModeLocalRotateTo(this.params.centerLocalRotationAngles);
    }

    private toScreenXY (position: THREE.Vector3, clientWidth: number, clientHeight: number) {
        const pos = position.clone();
        const projScreenMat = new THREE.Matrix4();
        projScreenMat.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        pos.applyMatrix4(projScreenMat);
        console.log(pos, clientWidth, clientHeight);
        return {
            x: ( pos.x + 1 ) * clientWidth / 2, // jqdiv.width() / 2 + jqdiv.offset().left,
            y: ( - pos.y + 1) * clientHeight / 2 // jqdiv.height() / 2 + jqdiv.offset().top
        };
    }

    async deactivate(): Promise<any> {
        this.expandAnimation.collapse();
        this.rotateAnimation.setModeDefault();
        this.domItems.forEach(i => i.remove());
        this.domItems.length = 0;
    }

    async runAction(action: string): Promise<any> {
        switch (action) {
            case 'activate': return await this.activate();
            case 'deactivate': return await this.deactivate();
            case 'moveBack':
                //this.scene.children.forEach(i => i.position.z += 10);
                return;
            case 'expand':
                this.expandAnimation.expand();
                return;
            case 'collapse':
                this.expandAnimation.collapse();
                return;
        }
    }

    animate() {
        this.insideMaterials.forEach(m => {
            const mm = m as THREE.MeshStandardMaterial;
            mm.map!.rotation += 0.0005;
        });

        this.animations.forEach(i => i.animate());
    }
}

