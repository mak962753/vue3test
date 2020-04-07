import {IAnimation} from "./animation";
import * as THREE from "three";

const backOffsets = new THREE.Vector3(13, 3, -8);
const backOffsetsInverse = backOffsets.clone().multiplyScalar(-1);

class AnimationTranslate implements IAnimation {
    private modeFn: (() => void)|null = null;

    constructor(private target: THREE.Object3D) {
    }

    public moveAlongVector(offs: THREE.Vector3): Promise<any> {
        let counter = 20;
        const
            speedX = offs.x / counter,
            speedY = offs.y / counter,
            speedZ = offs.z / counter;

        return new Promise((y/*, n*/) => {
            this.modeFn = () => {
                if (counter <= 0) {
                    this.modeFn = null;
                    y();
                    return;
                }

                this.target.position.x += speedX;
                this.target.position.y += speedY;
                this.target.position.z += speedZ;

                counter--;
            };
        });
    }

    public moveFront(): Promise<any> {
        return this.moveAlongVector(backOffsetsInverse);
    }

    public moveBack(): Promise<any> {
        return this.moveAlongVector(backOffsets);
    }

    animate(): void {
        if (this.modeFn)
            this.modeFn();
    }
}

export {AnimationTranslate}