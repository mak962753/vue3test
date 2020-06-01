import {lerp} from './noise-utils';

const samples: number[] = [];
const permutes: number[] = [];
const SAMPLE_COUNT = Math.pow(2, 8);
const SAMPLE_MASK = SAMPLE_COUNT - 1;

function getPermutes() {
    if (permutes.length)
        return permutes;
    
    permutes.length = 2 * SAMPLE_COUNT;
    
    for (let i = 0; i < SAMPLE_COUNT; i++) {
        permutes[i] = i;
    }
    
    for (let i = 0; i < SAMPLE_COUNT; i++) {
        const k = Math.round(Math.random() * SAMPLE_COUNT) & SAMPLE_MASK;
        const t = permutes[i];
        permutes[i] = permutes[k];
        permutes[k] = t;
        permutes[i + SAMPLE_COUNT] = permutes[i];
    }
    
    return permutes;
}
function getSamples() {
    if (samples.length)
        return samples;
    
    samples.length = SAMPLE_COUNT;
    
    for (let i = 0; i < SAMPLE_COUNT; i++) {
        samples[i] = Math.random();
    }
    
    return samples;
}

function noise1 (v: number, fader: (x:number)=>number = x => x): number {
    const samples = getSamples();
    const vi = Math.floor(v);
    const vMin = vi & SAMPLE_MASK;
    const vMax = (vMin + 1) & SAMPLE_MASK;
    const t = fader(v - vi);
    return lerp(samples[vMin], samples[vMax], t);    
}

function noise2(x: number, y:number, fade: (x:number)=>number = x => x) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    
    const tx = fade(x - xi);
    const ty = fade(y - yi);
    
    const rx0 = xi & SAMPLE_MASK;
    const rx1 = (xi+1) & SAMPLE_MASK;
    
    const ry0 = yi & SAMPLE_MASK;
    const ry1 = (yi+1) & SAMPLE_MASK;
    
    const r = getSamples();
    const p = getPermutes();
    // random values at the corners of the cell using permutation table
    const c00 = r[p[p[rx0] + ry0]];
    const c10 = r[p[p[rx1] + ry0]];
    const c01 = r[p[p[rx0] + ry1]];
    const c11 = r[p[p[rx1] + ry1]];
    
    const nx0 = lerp(c00, c10, tx);
    const nx1 = lerp(c01, c11, tx);
    
    return lerp(nx0, nx1, ty);
}

export {
    noise1,
    noise2
}