<template>
    <g>
        <path :d="path" stroke="#ff0" stroke-width="2" fill="none" style="clip-path: url(#__cp1);"></path>
        <path v-for="i in paths1" :d="i" stroke="#55f" stroke-width="0.5" fill="none" style="clip-path: url(#__cp1);" />
    </g>
</template>

<script lang="ts">
    import {ChartProviderKey, PropPoints, buildLinePath, Point} from './chart-utils';
    import {defineComponent, computed, inject } from 'vue';

    export default defineComponent({
        props: {...PropPoints},
        
        setup (props) {
            const chart = inject(ChartProviderKey);

            const fx = (x: number) => chart!.getXPoint(x);
            const fy = (y: number) => chart!.getYPoint(y);
            
            const path = computed(() => buildLinePath(props.points, fx, fy));
            
            const parts = computed(() => {
                return getSmoothLinePath(props.points);
            });
            const paths1 = computed(() => {
                return parts.value.map(p => p.getPath1(fx, fy));
            });
            
            return {path, paths1};
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
                    private e0: Point, private e1: Point, private e2: Point) {
        } 
        public getPath1(xx: (_:number) => number, yy: (_:number) => number): string {
            return `M${xx(this.s0[0])},${yy(this.s0[1])}L${xx(this.s2[0])},${yy(this.s2[1])}`;
        }
    }
    
    function getSmoothLinePath(points: Point[]): Part[] {
        const len = points.length;

        return points.reduce((a, s1, i) => {
            if (i < 1 || i > len - 2)
                return a;

            const s0 = points[i-1];
            const s2 = points[i+1];
            const e0 = s1;
            const e1 = s2;
            const e2 = i < len - 3 ? points[i+2] : s2;

            // const l0 = getLineParams(s2, s0);
            // const l1 = getLineParams(e2, e0);
            
            return [new Part(s0, s1, s2, e0, e1, e2) , ...a];
        }, [] as Part[]);
    }    
    
    function getLineParams([x1, y1]: Point, [x2, y2]: Point): [number, number] {
        const dx = x2-x1;
        const dy = y2-y1;
        const k = dx === 0 ? 0 : dy/dx;
        const b = y1 - k * x1;
        return [k, b];
        // y = k x + b 
        // k = y-b/x
        
        // y1 = k x1 + b; b = y1 - k x1 
        // y2 = k x2 + b; b = y2 - k x2
        // y1 - k x1 = y2 - k x2 => y1 - y2 = k (x1 - x2) => k = (y1-y2)/(x1-x2)
        // (0, y0?) (x1, y1)
    }
</script>

