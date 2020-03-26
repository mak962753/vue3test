<template>
    <g>
        <path :d="path" stroke="#ff0" stroke-width="2" fill="none" style="clip-path: url(#__cp1);"></path>
    </g>
</template>

<script lang="ts">
    import {ChartProviderKey, PropPoints, buildLinePath} from './chart-utils';
    import {defineComponent, computed, inject } from 'vue';
    
    export default defineComponent({
        props: {...PropPoints},
        setup(props) {
            const chart = inject(ChartProviderKey);
            const fx = (x: number) => chart!.getXPoint(x).toFixed(2);
            const fy = (y: number) => chart!.clipY(y).toFixed(2);
            const path = computed(() => buildLinePath(props.points, fx, fy));
            return { path };
        }
    })

</script>
