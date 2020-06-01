function lerp(v1: number, v2: number, n: number): number {
    return (1-n)*v1 + n*v2;
}
function fadeCos(v:number):number {
    return (1 - Math.cos(v * Math.PI)) / 2; 
}

function fade(v: number): number {
    return v*v*v*(v * (6 * v - 15) + 10);
}

function fadeSmoothstep(v: number): number {
    return v * v * (3 - 2 * v);
}

function map(v:number, r1_min:number, r1_max:number, r2_min:number, r2_max:number): number {
    v = Math.min(Math.max(v, r1_min), r1_max);
    return r2_min + ((v - r1_min)/(r1_max-r1_min)) * (r2_max-r2_min);
}
export {
    lerp,
    map,
    fade,
    fadeCos,
    fadeSmoothstep
}