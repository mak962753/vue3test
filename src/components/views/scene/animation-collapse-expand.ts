import {IAnimation} from "./animation";
import * as THREE from "three";

class AnimationCollapseExpand implements IAnimation
{
    private cnt: number = 0;
    private dir: number = 0;
    private lim: number = 30;

    constructor(private parts: THREE.Object3D[], private offsets: THREE.Vector3[]) {

    }

    public expand() {
        this.dir = 1;
    }

    public collapse() {
        this.dir = -1;
    }

    animate(): void {
        let move = false;

        if ( this.dir > 0 && this.cnt < this.lim) {
            this.cnt++;
            move = true;
        }

        if (this.dir < 0 && this.cnt > 0) {
            move = true;
            this.cnt--;
        }

        if (move) {
            this.parts.forEach((g, i) => {
                g.translateOnAxis(this.offsets[i], this.dir * 0.1);
            });
        }
    }
}

export {AnimationCollapseExpand}