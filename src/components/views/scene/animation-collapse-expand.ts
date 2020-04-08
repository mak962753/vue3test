import {IAnimation} from "./animation";
import * as THREE from "three";
import TWEEN from '@tweenjs/tween.js'

const Limit = 30;
class AnimationCollapseExpand implements IAnimation
{
    private cnt: number = 0;
    private cnt1: number = 0;
    private tween: TWEEN.Tween|null = null;
    private state: string = '';

    constructor(private parts: THREE.Object3D[], private offsets: THREE.Vector3[]) {

    }

    private disposeTween() {
        this.tween && TWEEN.remove(this.tween);
        this.tween = null;
    }

    private createTween(to: number) {
        this.tween && this.tween.stop();
        this.cnt1 = this.cnt;

        const diff = to === 0 ? this.cnt : (Limit - this.cnt1);
        const duration = 300 * diff / Limit;

        this.tween = new TWEEN.Tween({x: this.cnt})
            .to({x: to}, duration)
            .onUpdate(({x}) => this.cnt1 = x)
            .onStop(() => this.disposeTween())
            .onComplete(() => this.disposeTween())
            .start();
    }

    public expand() {
        if (!this.tween && this.cnt >= Limit)
            return;
        if (this.tween && this.state === 'expand')
            return;
        this.state = 'expand';
        this.createTween(Limit);
    }

    public collapse() {
        if (!this.tween && this.cnt <= 0)
            return;
        if (this.tween && this.state === 'collapse')
            return;
        this.state = 'collapse';
        this.createTween(0);
    }

    private onUpdate(cnt: number) {
        const diff = cnt - this.cnt;
        if (diff === 0)
            return;
        this.cnt = cnt;
        this.parts.forEach((g, i) => {
            g.translateOnAxis(this.offsets[i], diff * 0.1);
        });
    }

    animate(): void {
        this.onUpdate(this.cnt1);
        // let move = false;
        //
        // if ( this.dir > 0 && this.cnt < this.lim) {
        //     this.cnt++;
        //     move = true;
        // }
        //
        // if (this.dir < 0 && this.cnt > 0) {
        //     move = true;
        //     this.cnt--;
        // }
        //
        // if (move) {
        //     this.parts.forEach((g, i) => {
        //         g.translateOnAxis(this.offsets[i], this.dir * 0.1);
        //     });
        // }
    }
}

export {AnimationCollapseExpand}