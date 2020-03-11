<template>
    <g>
        <path :d="path" stroke="#ff0" stroke-width="2" fill="none" style="clip-path: url(#__cp1);"></path>
<!--        <path :d="path2" stroke="#ff0" stroke-width="2" fill="none" style="clip-path: url(#__cp1);"></path>-->
<!--        <path v-for="i in paths1" :d="i" stroke="#55f" stroke-width="0.5" fill="none" style="clip-path: url(#__cp1);" />-->
    </g>
</template>

<script lang="ts">
    import {ChartProviderKey, PropPoints, buildLinePath, Point} from './chart-utils';
    import {defineComponent, computed, inject } from 'vue';
    import {Line, Points} from "three";

    export default defineComponent({
        props: {
            ...PropPoints,
            dx: {type: Number, default: 2}
        },
        
        setup (props) {
            const chart = inject(ChartProviderKey);

            const fx = (x: number) => chart!.getXPoint(x);
            const fy = (y: number) => chart!.getYPoint(y);
            console.log(props.dx)
            const parts = computed(() => {
                return getSmoothLinePath(props.points, props.dx);
            });
            
            //const path = computed(() => buildLinePath(props.points, fx, fy));
            // const paths1 = computed(() => {
            //     return parts.value.map(p => p.getPath1(fx, fy));
            // });
            
            const path = computed(() => {
                if (props.points.length < 3) {
                    return buildLinePath(props.points, fx, fy); 
                }
                return [parts.value[0].getStartPath(fx, fy), ...parts.value.map(p => p.getCurve(fx, fy))];
            });
            
            return {path}; //, paths1, path2};
        }
    })
    
    /*            e-1                 e+1 
                  .-.      /  x1,y1 () . *
               .      *.--          . 
             .      s    .         .
           .*              .  e  .
        s-1                -- *
                  x2,y2/       s+1
         */
    class Part {
        constructor(private s0: Point, private s1: Point, private s2: Point, 
                    private e0: Point, private e1: Point, private e2: Point, 
                    private dx: number) {
        } 
        
        getStartPath(fx: (_:number) => number, fy: (_:number) => number): string {
            return `M${fx(this.s0[0])},${fy(this.s0[1])}`;
        }
        
        getCurve(fx: (_:number) => number, fy: (_:number) => number): string {
            const l1 = LineParams.createFrom2Points(this.s0, this.s2);
            const l2 = LineParams.createFrom2Points(this.e0, this.e2);
            const [cx1,cy1] = l1.getParallelThroughPoint(this.s1).getOffsetPoint(this.s1, this.dx);
            const [cx2,cy2] = l2.getParallelThroughPoint(this.e1).getOffsetPoint(this.e1, -this.dx);
            const [x,y] = this.s2;
            return `C${fx(cx1)},${fy(cy1)},${fx(cx2)},${fy(cy2)},${fx(x)},${fy(y)}`;
        }
        
        getPath1(fx: (_:number) => number, fy: (_:number) => number): string {
            const l1 = LineParams.createFrom2Points(this.s0, this.s2);
            const l2 = LineParams.createFrom2Points(this.e0, this.e2);
            const dx = 5;
            const cp1 = l1.getParallelThroughPoint(this.s1).getOffsetPoint(this.s1, this.dx);
            const cp2 = l2.getParallelThroughPoint(this.e1).getOffsetPoint(this.e1, -this.dx);
            const [x1,y1] = this.s1;
            const [x2,y2] = this.e1;
            return `M${fx(x1)},${fy(y1)}L${fx(cp1[0])},${fy(cp1[1])}M${fx(x2)},${fy(y2)}L${fx(cp2[0])},${fy(cp2[1])}`;
        }
    }
    
    function getSmoothLinePath(points: Point[], dx: number): Part[] {
        const len = points.length;

        return points.reduce((a, s1, i) => {
            if (i < 1 || i > len - 2)
                return a;
            
            const s0 = points[i-1];
            const s2 = points[i+1];
            const e0 = s1;
            const e1 = s2;
            const e2 = i < len - 2 ? points[i+2] : s2;
            
            return [...a, new Part(s0, s1, s2, e0, e1, e2, dx)];
        }, [] as Part[]);
    }    
    
    class LineParams {

        static createFrom2Points(p1: Point, p2: Point): LineParams {
            const [x1,y1] = p1;
            const [x2,y2] = p2;
            const dx = x2-x1;
            const dy = y2-y1;
            const k = dx === 0 ? 0 : dy/dx;
            const b = y1 - k * x1;

            // y = k x + b 
            // k = y-b/x

            // y1 = k x1 + b; b = y1 - k x1 
            // y2 = k x2 + b; b = y2 - k x2
            // y1 - k x1 = y2 - k x2 => y1 - y2 = k (x1 - x2) => k = (y1-y2)/(x1-x2)
            // (0, y0?) (x1, y1)
            
            return new LineParams(k, b);
        }
        
        constructor(private k: number, private b: number) { }

        getParallelThroughPoint([x, y]: Point): LineParams {
            const b = y - this.k * x;
            return new LineParams(this.k, b);
        }
        getOffsetPoint([x,y]: Point, dx: number): Point {
            const x1 = x + dx;
            const y1 = this.k * x1 + this.b;
            return [x1, y1];
        }
    }
</script>

