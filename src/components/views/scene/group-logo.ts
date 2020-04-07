import {Group} from "./group";
import {Commands} from "./commands";
import * as THREE from "three";
import {AnimationTranslate} from "./animation-translate";
import {AnimationRotate} from "./animation-rotate";

export class GroupLogo extends Group {
    private readonly translateAnimation: AnimationTranslate;
    private readonly rotateAnimation: AnimationRotate;

    constructor(private scene: THREE.Object3D) {
        super();
        this.scene.rotation.x += 0.5;
        this.translateAnimation = new AnimationTranslate(this.scene);
        const fakePivot = new THREE.Object3D();
        const fake = new THREE.Object3D();
        fakePivot.add(fake);
        this.rotateAnimation = new AnimationRotate(0, 0, new THREE.Vector3(), fake);
    }

    animate(): void {
        this.scene.rotation.y += 0.003;
        this.translateAnimation.animate();
        this.rotateAnimation.animate();
    }

    getIntersected(rayCaster: THREE.Raycaster): THREE.Object3D | null {
        return null;
    }

    async runAction(action: string): Promise<any> {
        switch (action) {
            case Commands.move_into_bg:
                await this.rotateAnimation.setModeRotateTo(0, new THREE.Vector3());
                await this.translateAnimation.moveBack();
                return;
            case Commands.move_from_bg:
                await this.rotateAnimation.setModeRotateTo(0, new THREE.Vector3());
                await this.translateAnimation.moveFront();
                return;
       }
    }

}