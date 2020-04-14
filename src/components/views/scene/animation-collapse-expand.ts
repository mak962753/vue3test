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

    constructor(private parts: THREE.Object3D[],
                private offsets: THREE.Vector3[],
                private duration: number,
                private onDone: ((()=>void))|null) {
    }

    private disposeTween() {
        this.tween && TWEEN.remove(this.tween);
        this.tween = null;
    }

    private createTween(to: number) {
        this.tween && this.tween.stop();
        this.cnt1 = this.cnt;

        const diff = to === 0 ? this.cnt : (Limit - this.cnt1);
        const duration = this.duration * diff / Limit;

        this.tween = new TWEEN.Tween({x: this.cnt})
            .to({x: to}, duration)
            .onUpdate(({x}) => {this.cnt1 = x; this.onUpdate(x);})
            .onStop(() => this.disposeTween())
            .onComplete(() => { this.disposeTween(); this.onDone && this.onDone();})
            .start();
    }

    public expand() {
        if (this.cnt >= Limit)
            return;
        if (this.state === 'expand')
            return;
        this.state = 'expand';
        this.createTween(Limit);
    }

    public collapse() {
        if (this.cnt <= 0)
            return;
        if (this.state === 'collapse')
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

    animate(): void {}

}

export {AnimationCollapseExpand}