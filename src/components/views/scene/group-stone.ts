import {Group} from "./group";
import * as THREE from "three";
import {Commands} from "./commands";
import {AnimationCollapseExpand} from "./animation-collapse-expand";
import {AnimationRotate} from "./animation-rotate";
import {AnimationTranslate, backOffsets, backOffsetsInverse} from "./animation-translate";
import {isInsideMat} from "./utils";
import {StoneGroupConfig} from "./config";


export class GroupStone extends Group {
    private readonly parts: THREE.Object3D[];

    private insideMaterials: THREE.MeshStandardMaterial[] = [];

    private readonly expandAnimation: AnimationCollapseExpand;
    private readonly rotateAnimation: AnimationRotate;
    private readonly translateAnimation: AnimationTranslate;
    private domItems: HTMLElement[] = [];
    // private readonly box: THREE.BoxHelper|null = null;

    constructor(private scene: THREE.Object3D,
                startingAngle: number,
                private containerId: string,
                private params: StoneGroupConfig) {
        super();

        this.parts = this.scene.children.filter(i => i instanceof THREE.Group);

        scene.traverse(i => {
            if (i instanceof THREE.Mesh && i.material instanceof THREE.MeshStandardMaterial) {
                const mat = i.material as THREE.MeshStandardMaterial;

                if (isInsideMat(mat.name)) {
                    mat.roughness = 1;
                    mat.map!.repeat = new THREE.Vector2(3, 3);
                    this.insideMaterials.push(mat);
                }
            }
        });


        const {rotationRadius: radius, offsets, rotationAxis, rotationSpeed} = this.params;
        const [x, z] = [radius * Math.cos(0), radius * Math.sin(0)];
        this.scene.position.set(x, 1, z);
        this.scene.rotation.set(0,0,0);

        this.expandAnimation = new AnimationCollapseExpand(
            this.parts,
            offsets.map(i => i.clone().multiplyScalar(0.15)),
            this.params.durationCollapseExpand,
            null /*() => {this.box?.update();}*/
        );
        this.rotateAnimation = new AnimationRotate(startingAngle, rotationSpeed, rotationAxis, this.params.durationRotation, scene);
        this.translateAnimation = new AnimationTranslate(this.scene.parent!, this.params.durationMoveToBg);

        // this.box = new THREE.BoxHelper(this.scene);
        // this.scene.parent?.parent?.add(this.box);
    }

    isIntersected(raycaster: THREE.Raycaster): boolean {
        const box = new THREE.Box3().setFromObject(this.scene);
        return raycaster.ray.intersectsBox(box);
    }


    async runAction(action: string, params?: any): Promise<any> {
        switch (action) {
            case Commands.activate_from_bg:
                {
                    let offsets = this.params.centerOffsets.clone();
                    const y = offsets.y + backOffsetsInverse.y;

                    offsets = offsets.add(backOffsetsInverse).multiply(new THREE.Vector3(1,0,1));

                    const to = new THREE.Vector3(0, y, 0);
                    const params1 = {duration: this.params.durationMoveToCenter};
                    const params2 = {duration: this.params.durationMoveToBg};
                    const work = this.translateAnimation.moveAlongVector(to, params1).then(() =>
                        this.translateAnimation.moveAlongVector(offsets, params2));

                    await Promise.all([
                        this.rotateAnimation.setModeRotateTo(this.params.centerGlobalRotationAngle, this.params.centerLocalRotationAngles),
                        // move into center
                        work
                    ]);

                    this.expandAnimation.expand();
                    this.createMenuItems();
                    break;
                }

            case Commands.deactivate: {
                // accepts param (bool) - whether to send it to background
                // this group is active in the moment -- need to deactivate it
                // delete menu items
                this.domItems.forEach(i => i.remove());
                this.domItems.length = 0;
                this.expandAnimation.collapse();

                const params1 = {duration: this.params.durationMoveToCenter};
                const params2 = {duration: this.params.durationMoveToBg};

                let work: Promise<any>;
                if (params) {
                    let offsets = this.params.centerOffsets.clone().multiplyScalar(-1);
                    offsets = offsets.add(new THREE.Vector3(backOffsets.x, 0, 0));
                    const to = new THREE.Vector3(0, backOffsets.y, backOffsets.z);

                    work = this.translateAnimation.moveAlongVector(to, params1).then(() =>
                        this.translateAnimation.moveAlongVector(offsets, params2));

                } else {
                    let offsets = this.params.centerOffsets.clone().multiplyScalar(-1);
                    work = this.translateAnimation.moveAlongVector(offsets, params1);
                }

                await work;

                this.rotateAnimation.setModeDefault();

                break;
            }

            case Commands.activate_from_fg:
                this.expandAnimation.expand();
                await this.rotateAnimation.setModeRotateTo(
                    this.params.centerGlobalRotationAngle,
                    this.params.centerLocalRotationAngles);
                this.createMenuItems();
                break;

            case Commands.move_into_bg: {
                const num = params ? Number(params) : 0;
                const angle = Math.PI / 4  + (num * Math.PI / 2);
                await this.rotateAnimation.setModeRotateTo(angle, new THREE.Vector3());
                await this.translateAnimation.moveBack();
                this.rotateAnimation.setModeDefault();

                break;
            }

            case Commands.move_from_bg: {
                const num = params ? Number(params) : 0;
                await this.rotateAnimation.setModeRotateTo(Math.PI / 2 * (num + 1), new THREE.Vector3());
                await this.translateAnimation.moveFront();
                this.rotateAnimation.setModeDefault();
                break;
            }

            case Commands.expand:
                this.expandAnimation.expand();
                break;

            case Commands.collapse:
                this.expandAnimation.collapse();
                break;
            case Commands.into_center:
                await this.translateAnimation.moveAlongVector(this.params.centerOffsets, {duration: this.params.durationMoveToCenter});
                break;
            case Commands.from_center:{
                const offsets = this.params.centerOffsets.clone().multiplyScalar(-1);
                await this.translateAnimation.moveAlongVector(offsets, {duration: this.params.durationMoveToCenter});
                break;
            }
        }
    }

    animate() {
        this.insideMaterials.forEach(m => {
            const mm = m as THREE.MeshStandardMaterial;
            mm.map!.rotation += 0.0005;
        });
    }

    private createMenuItems() {

        const container = document.getElementById(this.containerId);

        function createDiv(itemTitle: string, itemText: string, iconUrl: string, styles: {k: any, v: string}[]) {
            const i = document.createElement('div');

            i.className = "menu-item";
            styles.forEach(({k,v}) => {
                    i.style[k] = v;
            });
            const icon = document.createElement('div');
            icon.className = "menu-item__icon";
            icon.style.backgroundImage = `url(${iconUrl})`;
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
        // const box = new THREE.Box3().setFromObject(this.scene);
        // const rect = container!.getBoundingClientRect();
        // const pos1 = toScreenXY(box.min, rect.width, rect.height, this.camera);
        // const pos2 = toScreenXY(box.max, rect.width, rect.height, this.camera);
        // this.domItems.push(createDiv('', Text, [
        //     {k: 'top', v: `${pos1.y}px`},
        //     {k: 'left', v: `${pos1.x}px`},
        //     {k: 'bottom', v: `${rect.height - pos2.y}px`},
        //     {k: 'right', v: `${rect.width - pos2.x}px`},
        //     {k: 'background', v: `#fff7`},
        // ]));
        const items = this.params.menuItems.map(i => createDiv(i.itemTitle, i.itemText, i.iconUrl, i.styles));
        this.domItems.push(...items);
    }
}

