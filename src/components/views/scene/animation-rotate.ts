import {IAnimation} from "./animation";
import * as THREE from "three";
import {rotate} from "./utils";

const PI2 = 2 * Math.PI;
// const PI = Math.PI;
// const PI_2 = Math.PI / 2;

class AnimationRotate implements IAnimation {
    private modeFn: (() => void) = () => {};

    constructor(private angle: number,
                private rotationSpeed: number,
                private rotationAxis: THREE.Vector3,
                private scene: THREE.Object3D) {

        //scene.parent!.rotation.y = this.angle;

        rotate(this.scene, this.rotationAxis, this.angle);
        this.setModeDefault();
    }

    setModeDefault(): void {
        this.modeFn = () => this.animateDefault();
    }

    setModeLocalRotateTo(to: THREE.Vector3): Promise<any> {

        let counter = 10;

        const {x,y,z} = this.scene.rotation;
        const {x:x1, y:y1, z:z1} = to;
        const a1 = [x,y,z].map(i => i < 0 ? i + PI2 : i);

        this.scene.rotation.x = a1[0];
        this.scene.rotation.y = a1[1];
        this.scene.rotation.z = a1[2];

        const a2 = [x1,y1,z1];
        const speeds = new THREE.Vector3().fromArray(a1.map((v,i) => offsetToAngle(v, a2[i]) / counter));

        console.log(a1, a2, speeds);

        return new Promise((y,n) => {
            this.modeFn = () => {
                if (counter <= 0) {
                    this.modeFn = () => {
                    };
                    y();
                    return;
                }
                this.scene.rotation.x += speeds.x;
                this.scene.rotation.y += speeds.y;
                this.scene.rotation.z += speeds.z;
                counter--;
            };
        });
    }

    setModeRotateTo(to: number, local: THREE.Vector3): Promise<any> {
        this.angle = normAngle(this.angle);

        const offs = offsetToAngle(this.angle, to);
        const yOffs = offsetToAngle(this.scene.rotation.y, local.y);
        let counter = 20;
        const rotSpeed = offs / counter;
        const yRotSpeed = yOffs / counter;

        return new Promise((y,n) => {
            this.modeFn = () => {

                if (counter <= 0) {
                    this.modeFn = () => {
                    };
                    y();
                    return;
                }
                this.angle = normAngle(this.angle + rotSpeed);
                rotate(this.scene, this.rotationAxis, rotSpeed);
                this.scene.rotation.y = normAngle(this.scene.rotation.y + yRotSpeed);

                counter--;
            };
        });
    }

    animate(): void {
        this.modeFn();
    }

    animateDefault(): void {
        this.angle = normAngle(this.angle + this.rotationSpeed);
        rotate(this.scene, this.rotationAxis, this.rotationSpeed);
        this.scene.rotation.y = normAngle(this.scene.rotation.y + this.rotationSpeed);
        //this.scene.parent!.rotation.y += this.rotationSpeed;
    }
}


function offsetToAngle(currentAngle: number, targetAngle: number): number {
    const offs1 = targetAngle - currentAngle;
    const offs2 = (PI2 - Math.abs(offs1)) * (offs1 < 0 ? 1 : -1);
    return Math.abs(offs1) > Math.abs(offs2) ? offs2 : offs1;
}

function normAngle(angle: number):number {
    if (angle > 0)
        return angle > PI2 ? angle - PI2 : angle;
    return angle < -PI2 ? angle+PI2 : angle;
}
export {
    AnimationRotate
}
