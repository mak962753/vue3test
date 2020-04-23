<template>
    <div id="canv">
        <canvas id="canvas" width="400" height="300">
            This text is displayed if your browser does not support HTML5 Canvas.
        </canvas>
    </div>
</template>

<script lang="ts">
    import {defineComponent, onMounted, onUnmounted} from 'vue';
    import * as THREE from 'three';

    export default defineComponent({
        name: 'scene',
        setup() {
            onMounted(function () {
                const my_canvas = document.getElementById('canvas') as HTMLCanvasElement;
                const ctx = my_canvas!.getContext("2d");
                ctx!.fillStyle = "orange";
                ctx!.strokeStyle = "#000";

                const {width: w, height: h} = my_canvas;




                const start: [number, number] = [w * 0.05, h];
                const end: [number, number] = [w, h * 0.05];

                const r = 1.1 * (w + h) / 2

                const c = new THREE.Vector2().fromArray(circleCenter(start, end, r));

                const p = new THREE.Vector2().fromArray(start);

                let v = ortho(new THREE.Vector2().subVectors(p, c)).multiplyScalar(5.5);

                function circleCenter([x1, y1]: [number, number], [x2,y2]: [number, number], r:number): [number, number] {
                    const rr = r*r;
                    const q = Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));
                    const qq = q * q / 4;
                    const y3 = (y1+y2)/2;
                    const x3 = (x1+x2)/2;
                    const baseX = Math.sqrt(rr - qq) * (y1-y2) / q; //calculate once
                    const baseY = Math.sqrt(rr - qq) * (x2-x1) / q; //calculate once

                    const centerX1 = x3 + baseX; //center x of circle 1
                    const centerY1 = y3 + baseY; //center y of circle 1
                    return [centerX1, centerY1];
                    //const centerx2 = x3 - baseX; //center x of circle 2
                    //const centery2 = y3 - baseY; //center y of circle 2
                }


                function ortho(v: THREE.Vector2) : THREE.Vector2 {
                    return new THREE.Vector2(-v.y, v.x).normalize();
                }
                function applyCircularAcc(center: THREE.Vector2, pos: THREE.Vector2, v: THREE.Vector2, r: number): THREE.Vector2 {
                    console.log(center, pos);
                    const toC = center.clone().sub(pos);
                    const toC_ = toC.clone().normalize(); 
                    return toC_.multiplyScalar(v.lengthSq()).divideScalar(r); 
                }
                
                for (let i = 0; i < 100; i++ ) {
                    const a = applyCircularAcc(c, p, v, r);
                    v = v.add(a);
                    p.add(v);
                    console.log(p);
                    
                    ctx!.beginPath();
                    ctx!.arc(p.x, p.y,3,0, Math.PI * 2);
                    ctx!.stroke();
                }
                
                
                
                
            });
            
            onUnmounted(function () {
                
            });
            return {};
        }
    })
</script>

<style lang="scss">
    [id=canv] {
        display: inline-block;
        border: 1px solid #666;
        margin-top: 60px;
    }
</style>
/*
    (x1-x0)^2 + (y1-y0)^2 = (x2-x0)^2 + (y2-y0)^2

*/