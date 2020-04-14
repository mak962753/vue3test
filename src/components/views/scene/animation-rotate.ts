import {IAnimation} from "./animation";
import * as THREE from "three";
import TWEEN from '@tweenjs/tween.js'

const PI2 = 2 * Math.PI;

class AnimationRotate implements IAnimation {
    private defaultRotationTween: TWEEN.Tween|null = null;
    private rotationTween: TWEEN.Tween|null = null;

    constructor(private angle: number,
                private rotationSpeed: number,
                private rotationAxis: THREE.Vector3,
                private duration: number,
                private scene: THREE.Object3D) {

        this.currentAngle = this.angle;
        this.localAngle = 0;
        const {x,z} = rotationAxis;
        this.scene.parent!.rotation.x = x;
        this.scene.parent!.rotation.z = z;

        this.setModeDefault();
    }

    setModeDefault(): void {
        this.rotationTween && this.rotationTween.stop();
        this.rotationTween = null;

        this.defaultRotationTween && this.defaultRotationTween.stop();
        this.defaultRotationTween = new TWEEN.Tween(this)
            .to({currentAngle: `+${Math.PI}`}, this.rotationSpeed * 2500000)
            .repeat(Infinity)
            .start();
    }

    setModeRotateTo(to: number, local: THREE.Vector3): Promise<any> {
        this.defaultRotationTween && this.defaultRotationTween.stop();

        const offs = offsetToAngle(this.currentAngle, to);
        const yOffs = offsetToAngle(this.localAngle, local.y);
        this.rotationTween && this.rotationTween.stop();

        this.rotationTween = new TWEEN.Tween(this).to({
            localAngle: this.localAngle + yOffs,
            currentAngle: this.currentAngle + offs
        }, this.duration);


        return new Promise(y => {
            if (this.rotationTween)
                this.rotationTween
                    .onComplete(y)
                    .onStop(y)
                    .start();
        });

    }

    animate(): void {}

    public get currentAngle(): number { return this.scene.parent!.rotation.y; }
    public set currentAngle(v:number) { this.scene.parent!.rotation.y = v; }

    public get localAngle(): number { return this.scene.rotation.y; }
    public set localAngle(v: number) {
        this.scene.rotation.y = v;
    }
}


function offsetToAngle(currentAngle: number, targetAngle: number): number {
    const offs1 = (targetAngle - currentAngle) % PI2;
    const offs2 = (PI2 - Math.abs(offs1)) * (offs1 < 0 ? 1 : -1);
    return Math.abs(offs1) > Math.abs(offs2) ? offs2 : offs1;
}

export {
    AnimationRotate
}
