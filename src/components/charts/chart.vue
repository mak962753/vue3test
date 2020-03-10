<template>
    <div class="chart-wrapper">
        <svg width="100%" height="100%" :viewBox="`0 0 ${chart.width} ${chart.height}`">
            <defs>
                <clipPath id="__cp1">
                    <rect x="0" y="0" :width="chart.areaWidth" :height="chart.areaHeight"></rect>
                </clipPath>
            </defs>
            <!-- axes -->
            <g>
                <!-- Y -->
                <text v-for="t in yTitles" :x="t.x" :y="t.y" :font-size="chart.axisFontSize" fill="#fff" text-anchor="middle">{{t.text}}</text>
                <!-- X -->
                <text v-for="t in xTitles" :x="t.x" :y="t.y" :font-size="chart.axisFontSize" fill="#fff" text-anchor="middle">{{t.text}}</text>
            </g>
            <!-- grid lines -->
            <g>
                <rect :x="chart.areaX" :y="chart.areaY" :width="chart.areaWidth" :height="chart.areaHeight" fill="#303845" stroke="none"></rect>
                <path :d="`M${chart.areaX - chart.tickSize} ${chart.areaY}h${chart.areaWidth + chart.tickSize}v${chart.areaHeight + chart.tickSize}v${-chart.tickSize}h${-(chart.areaWidth + chart.tickSize)}h${chart.tickSize}v${chart.tickSize}v${-chart.areaHeight-chart.tickSize}`" stroke="#fff" fill="none"></path>
                <path :d="xLinesPath" stroke="#fff" fill="none" stroke-width="0.4"></path>
                <path :d="yLinesPath" stroke="#fff" fill="none" stroke-width="0.4"></path>
            </g>
            
            <!-- series -->
            <svg :x="chart.areaX" :y="chart.areaY" :width="chart.areaWidth" :height="chart.areaHeight" fill="none">
                <slot>

                </slot>
            </svg>
        </svg>
    </div>
</template>

<script lang="ts">
    import {computed, defineComponent, reactive, provide, InjectionKey, ComputedRef} from 'vue';
    import {roundNumber} from '../../shared/utils';
    import {ChartProviderKey, getChartDefaults, ChartParams, GridLine, AxisTitle} from './chart-utils';
    
    const props = {
        xGridInterval: {type: Number, default: 0},
        yGridInterval: {type: Number, default: 0},
        xMin: {type: Number, default: 0},
        yMin: {type: Number, default: 0},
        xMax: {type: Number, default: 100},
        yMax: {type: Number, default: 100},
    };
    
    
    export default defineComponent({
        props,
        
        setup(props) {
            
            const chart = getChartDefaults();
            
            const xLines = computed(() => getGridLines(props.xMin, props.xMax, props.xGridInterval, chart.areaWidth));
            const yLines = computed(() => getGridLines(props.yMin, props.yMax, props.yGridInterval, chart.areaHeight));
            const xTitles = computed(() => getXTitles(chart, xLines.value));
            const yTitles = computed(() => getYTitles(chart, yLines.value));
            
            const xLinesPath = computed(() => getXGridLinesPath(chart, xLines.value));
            const yLinesPath = computed(() => getYGridLinesPath(chart, yLines.value));
            
            const xRatio = computed(() => {
                const dx = props.xMax - props.xMin;
                return dx === 0 ? 0 : chart.areaWidth / dx;
            });
            const yRatio = computed(() => {
                const dy = props.yMax - props.yMin;
                return dy === 0 ? 0 : chart.areaHeight / dy;
            });
            
            const chartProvider = {
                props,
                chart,
                xRatio,
                yRatio,
                clipY(y: number): number {
                    y = this.getYPoint(y);
                    return Math.max(0, Math.min(y, this.chart.areaHeight));
                },
                getYPoint(y: number): number {
                    return this.chart.areaHeight - this.yRatio.value * (y - this.props.yMin);
                },
                getXPoint(x: number): number {
                    return 0.5 + this.xRatio.value * (x - this.props.xMin);
                }
            }; 

            provide(ChartProviderKey, chartProvider);
                
            return {
                chart,
                yTitles,
                xTitles,
                xLinesPath,
                yLinesPath
            };
        }
    })

    function getYTitles(chart: ChartParams, lines: GridLine[]): AxisTitle[] {
        const { areaX, areaY, areaHeight } = chart;
        const yStart = areaY + areaHeight;
        const x = areaX - 15;
        return lines.map(i => ({ text: String(i.value), x, y: yStart - i.offset + 2 })).filter((_,  i) => i % 2 == 0);
    }
    function getXTitles(chart: ChartParams, lines: GridLine[]): AxisTitle[] {
        const {areaY, areaX, areaHeight} = chart;
        const y = areaY + areaY + areaHeight + 15;
        return lines.map(i => ({x: areaX + i.offset, y, text: String(i.value) })).filter((_,  i) => i % 2 == 0);
    }
    
    function getXGridLinesPath(chart: ChartParams, lines: GridLine[]): string {
        const {areaY, areaX, areaHeight, tickSize} = chart;
        return lines.map(({offset}, i) => `M${areaX + offset} ${areaY}v${areaHeight + tickSize * ((i + 1) % 2)}`).join('') || 'M0,0';
    }
    
    function getYGridLinesPath(chart: ChartParams, lines: GridLine[]): string {
        const { areaX, areaY, areaWidth, areaHeight, tickSize } = chart;
        const yStart = areaY + areaHeight;
        const xStart = areaX + areaWidth;
        const [line, lineWithTick] = [-areaWidth, -areaWidth - tickSize];
        return lines.map(({offset}, i) => `M${xStart} ${yStart - offset}h${!!((i+1)%2) ? lineWithTick : line}`).join('') || 'M0,0';
    }

    function getGridLines(min: number, max: number, interval: number, size: number): GridLine[] {
        if (!interval || interval <= 0 || isNaN(max) || isNaN(min)) {
            return [];
        }
        
        const lineCount = Math.ceil(Math.abs(max - min) / interval);
        if (lineCount < 2)
            return [];
        
        const step = size / lineCount;
        
        return new Array(lineCount + 1).join(',').split(',').map((v, i) => {
            const offset = i * step;
            const value = roundNumber(min + interval * i, 1);
            return { 
                value, 
                offset
            };
        });
    }

</script>

<style lang="scss">
    .chart-wrapper {
        max-width: 1000px;
        
        background:#242c39; //36 44 57
        border-radius: 7px;
        border: 1px solid transparent;
        margin: 6px 0;
        text-align: center;
    }
</style>

