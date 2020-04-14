import {Group} from "./group";
import {Commands} from "./commands";
import * as THREE from "three";
import {AnimationTranslate} from "./animation-translate";
import {AnimationRotate} from "./animation-rotate";
import {LogoConfig} from "./config";

export class GroupLogo extends Group {
    private readonly translateAnimation: AnimationTranslate;
    private readonly rotateAnimation: AnimationRotate;

    constructor(private scene: THREE.Object3D, private logoConfig: LogoConfig) {
        super();
        this.scene.rotation.x += logoConfig.initialRotation.x;
        this.scene.rotation.y += logoConfig.initialRotation.y;
        this.scene.rotation.z += logoConfig.initialRotation.z;

        this.translateAnimation = new AnimationTranslate(this.scene, logoConfig.durationMoveToBg);
        const fakePivot = new THREE.Object3D();
        const fake = new THREE.Object3D();
        fakePivot.add(fake);
        this.rotateAnimation = new AnimationRotate(0, 0, new THREE.Vector3(), logoConfig.durationRotation, fake);
    }

    animate(): void {
        let {x,y,z} = this.logoConfig.rotationSpeed;
        this.scene.rotation.x += x;
        this.scene.rotation.y += y;
        this.scene.rotation.z += z;
    }

    isIntersected(rayCaster: THREE.Raycaster): boolean {
        return false;
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