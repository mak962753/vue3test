<template>
    <div id="canv">
        <canvas id="canvas" width="800" height="600">
            This text is displayed if your browser does not support HTML5 Canvas.
        </canvas>
        <div style="position: absolute; top: 0;">background</div>
    </div>
</template>

<script lang="ts">
    import {defineComponent, onMounted, onUnmounted} from 'vue';
    import * as T from 'three';
    import {findCircleCenter, ortho} from './canv/utils';
    import {noise1, noise2} from '../../shared/noise1';
    import {map, fade, fadeCos} from '../../shared/noise-utils';
    class Comet {
        private center: T.Vector2;
        private velocity: T.Vector2;
        private position: T.Vector2;

        constructor(
            private start: T.Vector2,
            private end: T.Vector2,
            private orbitRadius: number 
        ) {
            const speedRatio = 1.10;
            this.center = findCircleCenter(start, end, orbitRadius)[0];
            this.position = start.clone();
            this.velocity = ortho(new T.Vector2().subVectors(this.position, this.center)).multiplyScalar(speedRatio);
        }

        update() {
            const a = this.getAcceleration();
            this.velocity.add(a);
            this.position.add(this.velocity);
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.save();
            const {position: p, velocity: v} = this;
            ctx.shadowColor = 'hsl(300,60%,35%)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y,6,0, Math.PI * 2);
            ctx.strokeStyle = "#000";
            ctx.fillStyle = "hsl(300, 50%, 30%)";
            ctx.fill();
            const v_ = v.clone().normalize();
            const p1 = new T.Vector2().subVectors(p, v_.clone().multiplyScalar(3));
            ctx.shadowColor = 'hsl(30, 50%, 90%)';
            ctx.shadowBlur = 4;
            ctx.fillStyle = "hsl(30,50%,90%)";
            ctx.beginPath();
            ctx.arc(p1.x, p1.y,4,0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            const p2 = new T.Vector2().subVectors(p1, v_.clone().multiplyScalar(4));
            ctx.arc(p2.x, p2.y,2,0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        private getAcceleration(): T.Vector2 {
            // a = v^2/r
            const toC = this.center.clone().sub(this.position);
            const toC_ = toC.clone().normalize();
            return toC_.multiplyScalar(this.velocity.lengthSq()).divideScalar(this.orbitRadius);
        }
    }
    
    let i = 0;
    
    class Bg {
        n: number[] = [];
        
        constructor(w:number, h: number) {
            const f = 0.05;
            for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++)
                    this.n[y * h + x] = noise2(x * f, y * f);            
        }

        draw (ctx: CanvasRenderingContext2D) {
            const data = ctx.getImageData(0,0, 100, 100);
            for (let y = 0; y < 100; y++)
                for (let x = 0; x < 100; x++) {
                    const c = 255 * this.n[y * ctx.canvas.height + x];
                    let pos = (y * 100 + x) * 4;
                    data.data[pos++] = c;
                    data.data[pos++] = c;
                    data.data[pos++] = c;
                    data.data[pos++] = 255;
                }
            ctx.putImageData(data, 0,0, 0, 0, 100, 100);    
        }
    }
    
    class Circler {
        x: number;
        y: number;
        tx :number = Math.random() * 200;
        ty :number = Math.random() * 200;
        n: number[] = []; 
        constructor(w:number, h: number) {
            this.x = Math.round(Math.random() * w);
            this.y = h/2;
        }
        
        update(ctx: CanvasRenderingContext2D) {
            this.x = map(noise1(this.tx * 1.1, fade), 0,1, 0, ctx.canvas.width);
            this.y = map(noise1(this.ty, fadeCos), 0,1, 0, ctx.canvas.height);
            this.tx+= 0.005;
            this.ty+= 0.005;
        }
        
        draw (ctx: CanvasRenderingContext2D) {
            // ctx.fillStyle = "hsl(300, 50%, 30%)";
            // ctx.arc(this.x, this.y,2,0, Math.PI * 2);
            // ctx.fill();

            function line(o:number, f:number, a:number, c:string) {
                ctx.save()
                ctx.strokeStyle = c;
                ctx.lineWidth = 1;
                const h = ctx.canvas.height/2;
                const fnY = (t: number, a: number = 1, f: number = 1) => h + map(noise1(t * f) , 0, 1, -h, h)* a;
                ctx.beginPath();
                ctx.moveTo(0, fnY(0, a, f));
                for (let i = 1; i < ctx.canvas.width; i++) {
                    ctx.lineTo(i, fnY(i+o, a, f));
                }
                ctx.stroke();
                ctx.restore();
            }
            
            //line(i++, 0.5, 0.1, "#fff");
            line(0, 0.5, 0.5, "#fff");
            line(0, 0.5, 0.3, "#ff0");
        }
    }
    export default defineComponent({
        name: 'scene',
        setup() {
            let done = false;

            onMounted(function () {
                const my_canvas = document.getElementById('canvas') as HTMLCanvasElement;
                const ctx = my_canvas!.getContext("2d");
                const {width: w, height: h} = my_canvas;
                const start = new T.Vector2().fromArray([0, h*0.96]);
                const end  = new T.Vector2().fromArray([w*.8, 0]);
                const r = 2.1 * (w + h) / 2; // approx radius of an orbit for a comet
                const cicler = new Circler(w, h);
                const bg = new Bg(w, h);
                const comet = new Comet(start, end, r);
                
                let i = 0;
                function clear(ctx: CanvasRenderingContext2D) {
                    ctx.save();
                    ctx.globalAlpha = 0.2;
                    i%2==0 && ctx!.drawImage(ctx!.canvas,  0, 0, ctx!.canvas.width - 1, ctx!.canvas.height - 1);
                    ctx.restore();
                    ctx.save();
                    i++;
                    ctx.globalCompositeOperation ='destination-out';
                    // if (i < 0) {
                    //     ctx.globalAlpha = 0.2;
                    //     i % 2 === 0 && ctx!.drawImage(ctx!.canvas,  0, 0, ctx!.canvas.width - 2, ctx!.canvas.height - 2);
                    //     i % 2 !== 0 && ctx!.drawImage(ctx!.canvas, 0, 0, ctx!.canvas.width, ctx!.canvas.height, 2, 2, ctx!.canvas.width, ctx!.canvas.height);
                    // }

                    ctx.globalAlpha = 0.1;

                    ctx.fillStyle = '#000000ff';
                    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

                    ctx.restore();
                }


                function frame() {
                    bg.draw(ctx!);
                    cicler.update(ctx!);
                    comet.draw(ctx!);
                    comet.update();
                    cicler.draw(ctx!);
                    clear(ctx!);
                }

                function animate() {
                    if (done)
                        return;
                    frame();
                    requestAnimationFrame(animate);
                }

                animate();
            });
            
            onUnmounted(function () {
                done = true;
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
        position: relative;
        background: transparent;
    }
    .main-content  {
        background: #000;
    }
</style>