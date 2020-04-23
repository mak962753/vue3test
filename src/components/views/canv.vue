<template>
    <div id="canv">
        <canvas id="canvas" width="200" height="200">
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
                const c = new THREE.Vector2(w/2, h/2);
                const r = 50;
                const p = new THREE.Vector2(r, 0).add(c);
                let v = o(new THREE.Vector2().subVectors(p, c)).multiplyScalar(5.5);
                

                function o(v: THREE.Vector2) : THREE.Vector2 {
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
        margin-top: 60px;
    }
</style>
/*
    (x1-x0)^2 + (y1-y0)^2 = (x2-x0)^2 + (y2-y0)^2

*/