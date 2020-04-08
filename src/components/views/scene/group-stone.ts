import {Group} from "./group";
import * as THREE from "three";
import {Commands} from "./commands";
import {AnimationCollapseExpand} from "./animation-collapse-expand";
import {AnimationRotate} from "./animation-rotate";
import {AnimationTranslate, backOffsets, backOffsetsInverse} from "./animation-translate";
import {isInsideMat} from "./utils";

interface StoneGroupParams {
    offsets: THREE.Vector3[];
    rotationAxis: THREE.Vector3;
    rotationSpeed: number;
    rotationRadius: number;
    centerLocalRotationAngles: THREE.Vector3,
    centerGlobalRotationAngle: number,
    centerOffsets: THREE.Vector3
}

const Stone2Params: StoneGroupParams = {
    offsets: [
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(0, 1, 0)
    ],
    rotationAxis: new THREE.Vector3(0.2, 0, 0), //new THREE.Vector3(0.1, 1, 0.3)
    rotationSpeed: 0.0075,
    rotationRadius: 5,
    centerLocalRotationAngles: new THREE.Vector3(0, Math.PI/4, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2,
    centerOffsets: new THREE.Vector3(0,0.5,0)
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
    centerLocalRotationAngles: new THREE.Vector3(0, Math.PI/2, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2,
    centerOffsets: new THREE.Vector3(0,-1, 3)

};

const Stone4Params: StoneGroupParams = {
    offsets: [
        new THREE.Vector3(-1, 1, -1.5),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, -0.5, -1.5),
        new THREE.Vector3(1, -1, 1)
    ],
    rotationAxis: new THREE.Vector3(0.7, 0, 0.3),
    rotationSpeed: 0.0085,
    rotationRadius: 6.5,
    centerLocalRotationAngles: new THREE.Vector3(0,  3.1415+ -0.5, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2,
    centerOffsets: new THREE.Vector3(0, 1.5, 0)

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

    private readonly expandAnimation: AnimationCollapseExpand;
    private readonly rotateAnimation: AnimationRotate;
    private readonly translateAnimation: AnimationTranslate;

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
        this.scene.rotation.set(0,0,0);

        this.expandAnimation = new AnimationCollapseExpand(this.parts, offsets.map(i => i.multiplyScalar(0.15)));
        this.rotateAnimation = new AnimationRotate(startingAngle, rotationSpeed, rotationAxis, scene);
        this.translateAnimation = new AnimationTranslate(this.scene.parent!);

        this.objects = this.parts.reduce((a, i) => {
            return [...a, ...i.children];
        }, [] as THREE.Object3D[]);
    }

    getIntersected(raycaster: THREE.Raycaster): THREE.Object3D | null {
        const intersects = raycaster.intersectObjects(this.objects, false); //array
        return intersects.length > 0 ? intersects[0].object : null;
    }


    async runAction(action: string, params?: any): Promise<any> {
        switch (action) {
            case Commands.activate_from_bg:
                await Promise.all([
                    this.rotateAnimation.setModeRotateTo(this.params.centerGlobalRotationAngle, this.params.centerLocalRotationAngles),
                    this.translateAnimation.moveAlongVector(this.params.centerOffsets.clone().add(backOffsetsInverse))
                ]);
                this.expandAnimation.expand();
                this.createMenuItems();
                return;

            case Commands.activate_from_fg:
                this.expandAnimation.expand();
                await this.rotateAnimation.setModeRotateTo(
                    this.params.centerGlobalRotationAngle,
                    this.params.centerLocalRotationAngles);
                this.createMenuItems();
                return;

            case Commands.move_into_bg: {
                const num = params ? Number(params) : 0;
                const angle = Math.PI / 4  + (num * Math.PI / 2);
                console.log(num, angle);
                await this.rotateAnimation.setModeRotateTo(angle, new THREE.Vector3());
                await this.translateAnimation.moveBack();
                this.rotateAnimation.setModeDefault();

                return;
            }

            case Commands.move_from_bg: {
                const num = params ? Number(params) : 0;
                await this.rotateAnimation.setModeRotateTo(Math.PI / 2 * (num + 1), new THREE.Vector3());
                await this.translateAnimation.moveFront();
                this.rotateAnimation.setModeDefault();
                return;
            }

            case Commands.deactivate:
                this.domItems.forEach(i => i.remove());
                this.domItems.length = 0;
                this.expandAnimation.collapse();
                this.rotateAnimation.setModeDefault();
                return;

            case Commands.expand:
                this.expandAnimation.expand();
                return;

            case Commands.collapse:
                this.expandAnimation.collapse();
                return;
            case Commands.into_center:
                await this.translateAnimation.moveAlongVector(this.params.centerOffsets);
                return;
            case Commands.from_center:
                await this.translateAnimation.moveAlongVector(this.params.centerOffsets.clone().multiplyScalar(-1));
                return;
        }
    }

    animate() {
        this.insideMaterials.forEach(m => {
            const mm = m as THREE.MeshStandardMaterial;
            mm.map!.rotation += 0.0005;
        });

        this.expandAnimation.animate();
        this.rotateAnimation.animate();
        this.translateAnimation.animate();
    }

    private createMenuItems() {

        const container = document.getElementById(this.containerId);
        // const box = new THREE.Box3().setFromObject(this.scene);
        // const rect = container!.getBoundingClientRect();
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
                this.domItems.push(createDiv('Football', Text, [{k: 'top', v: `35%`}, {k: 'right', v: `60%`}]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `35%`}, {k: 'left', v: `63%`}]));
                this.domItems.push(createDiv('Football', Text, [{k: 'top', v: `55%`}, {k: 'right', v: `60%`}]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `55%`}, {k: 'left', v: `63%`}]));
                break;
            case 3:
                this.domItems.push(createDiv('Football', Text,[{k: 'top',  v: `15%`}, {k: 'left', v: `55%`}, {k: 'transform', v: 'translateX(-50%)'} ]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `55%`}, {k: 'right', v: `57%`}]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top', v: `55%`}, {k: 'left', v: `65%`}]));
                break;
            case 2:
                this.domItems.push(createDiv('Football', Text,[{k: 'top',  v: `21%`}, {k: 'left', v: `50%`}, {k: 'transform', v: 'translateX(-50%)'} ]));
                this.domItems.push(createDiv('Football', Text,[{k: 'top',  v: `65%`}, {k: 'left', v: `50%`}, {k: 'transform', v: 'translateX(-50%)'} ]));
                break;
        }
    }
}

