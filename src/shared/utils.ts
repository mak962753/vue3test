
function roundNumber(num: number, scale: number): number {
    const hasExponent = String(num).indexOf('e') > -1;
    if (hasExponent) {
        const [n,e] = String(num).split('e').map(Number);
        const sign = e + scale > 0 ? '+' : '';
        const num1 = Math.round(+(`${n}e${sign}${e + scale}`));
        return +(`${num1}e-${scale}`);
    }
    const num1 = Math.round(+(`${num}e+${scale}`));
    return +(`${num1}e-${scale}`);
}

export {
    roundNumber
}