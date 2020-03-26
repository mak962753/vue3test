<template>
    <div>About</div>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
<!--    <div>-->
<!--        <label> xMin <input type="text" :value="xMin" @change="changeXMin($event)" /></label>-->
<!--    </div>-->
<!--    <div><label> xMax <input type="text" :value="xMax" @input="changeXMax($event)" /></label></div> -->
<!--    {{xMax}}-->
<!--    <xx-chart :x-grid-interval="10"-->
<!--              :y-grid-interval="10"-->
<!--              :x-min="xMin"-->
<!--              :x-max="xMax">-->
<!--        <xx-chart-line :points="points"></xx-chart-line>-->
<!--        <xx-chart-smooth-line :points="points" :dx="0.1" />-->
<!--        <xx-chart-smooth-line :points="points1" />-->
<!--    </xx-chart>-->
</template>

<script lang="ts">
    import {defineComponent, ref, computed} from 'vue'; 
    import * as charts from '../../charts';
    import {Point} from '../../charts/chart-utils';
    
    export default defineComponent({
        components: {
            'xx-chart': charts.Chart,
            'xx-chart-line': charts.ChartLine,
            'xx-chart-smooth-line': charts.ChartSmoothLine
        },
        
        setup() {
            const [xMin,xMax] = [ref(0), ref(100)];
            const points1 = ref([[20, 30], [40, 50], [60, 10], [80, 60]]);
            const i = ref(0);
            setInterval(() => {
                i.value++;
            }, 500);
            function changeXMin({target}: Event) {
                xMin.value = parseInt((target as any).value) || 0;
            }
            function changeXMax({target}: Event) {
                xMax.value = parseInt((target as any).value) || 100;
            }

            const points = computed(() => randomLine(xMin.value, xMax.value/*, i.value*/));
            return { points, xMin, xMax, points1, changeXMin, changeXMax};
        }
    })
    
    function randomLine(xMin: number, xMax: number, /*i: number*/): Point[] {
        const n = Math.abs(xMax - xMin);
        const pointNumber = 200;
        const dx = n/pointNumber;
        const a = 0.01;
        const b = 0.02; //play with these values to your liking
        const result: Point[] = [];        
        for (let x = xMin; x < xMax; x += dx) {
            let y = Math.sin(a * x * x) + b * x * Math.random();
            ////or using your randomMumber function: y = a * x^2 + randomMumber(- b * x / 2, b * x / 2)
            result.push([
                x,
                y
            ]);
        }
        return result;
    }
</script>