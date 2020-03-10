import {ComputedRef, InjectionKey} from "vue";

interface ChartParams {
    height: number;
    width: number;
    areaWidth: number;
    areaHeight: number;
    areaY: number;
    areaX: number;
    fontSize: number;
    axisFontSize: number;
    tickSize: number;
}

interface ChartProvider {
    chart: ChartParams;
    props: {xMin: number, xMax: number, yMin: number, yMax: number};
    xRatio: ComputedRef<number>;
    yRatio: ComputedRef<number>;
    clipY(y:number): number;
    getXPoint(x: number): number;
    getYPoint(y: number): number;
}

const ChartProviderKey: InjectionKey<ChartProvider> = Symbol('chart-info');
type Point = [number, number];

interface GridLine {
    value: number;
    offset: number;
}

interface AxisTitle {
    text: string;
    x: number;
    y: number;
}

function getChartDefaults(): ChartParams {
    return {
        fontSize: 11,
        axisFontSize: 9,
        height: 480,
        width: 600,
        areaX: 40,
        areaY: 10,
        areaHeight: 420,
        areaWidth: 540,
        tickSize: 4
    };
}

const PropPoints = {
    points: {type: Array as () => Point[], default: []}
};

function buildLinePath<T>(points: Point[], fx: (_:number)=>T, fy: (_:number)=>T): string {
    if (!points || !points.length)
        return 'M0 0';
    const pointData = points.map(([x, y]) => `L${fx(x)} ${fy(y)}`).join('');
    const [x0,y0] = points[0];
    const start = `M${fx(x0)} ${fy(y0)}`;
    return `${start}${pointData}`;
}

export {
    ChartProviderKey,
    ChartParams,
    GridLine,
    AxisTitle,
    Point,
    PropPoints,
    getChartDefaults,
    buildLinePath
}