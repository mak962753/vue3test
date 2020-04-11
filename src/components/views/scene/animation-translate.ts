import {IAnimation} from "./animation";
import * as THREE from "three";
import TWEEN from '@tweenjs/tween.js';

const backOffsets = new THREE.Vector3(13, 6, -8);
const backOffsetsInverse = backOffsets.clone().multiplyScalar(-1);

class AnimationTranslate implements IAnimation {

    constructor(private target: THREE.Object3D) { }

    public moveAlongVector(offs: THREE.Vector3, params: {duration: number}): Promise<any> {
        const {x,y,z} = this.target.position.clone().add(offs);
        const tween = new TWEEN.Tween(this.target.position)
            .to({x,y,z}, params.duration)
            .easing(TWEEN.Easing.Sinusoidal.Out);
        return new Promise((y/*, n*/) => {
            tween.onComplete(y).onStop(y).start();
        });
    }

    public moveFront(): Promise<any> {
        return this.moveAlongVector(backOffsetsInverse, {duration: 700});
    }

    public moveBack(): Promise<any> {
        return this.moveAlongVector(backOffsets, {duration: 700});
    }

    animate(): void {
    }
}

export {AnimationTranslate, backOffsets, backOffsetsInverse}