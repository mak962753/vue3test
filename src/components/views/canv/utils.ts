import * as T from "three";

/**
 * calculates possible circle centers  by two points and a radius
 */
function findCircleCenter(point1: T.Vector2, point2: T.Vector2, radius: number): [T.Vector2, T.Vector2] {
    const rr = radius*radius;
    const {x:x1, y:y1} = point1;
    const {x:x2, y:y2} = point2;
    // given points make line Q
    // find distance between points (iow length of line Q)
    const q = Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));

    // find middle point (A) between 2 given points
    const y3 = (y1+y2)/2;
    const x3 = (x1+x2)/2;

    // find a vector along line between points, since it's length is q - normalize it
    const qVector = [(x1-x2)/q, (y1-y2)/q];
    // make it orthogonal to the Q line
    const qVectorI = [qVector[1], -qVector[0]];

    // so now point A, circle center, and any given point make a triangle so we can calculate distance from A to center
    const l = Math.sqrt(rr - (q * q / 4)); // radius^2 - (q/2)^2

    // find a vector from point A to center (just multiply inv. q vector by the l)
    const baseX = l * qVectorI[0]; //calculate once
    const baseY = l * qVectorI[1]; //calculate once

    // either go along vector from point A
    const centerX1 = x3 + baseX; //center x of circle 1
    const centerY1 = y3 + baseY; //center y of circle 1

    // or go in reverse direction from point A
    const centerX2 = x3 - baseX; //center x of circle 2
    const centerY2 = y3 - baseY; //center y of circle 2

    return [
        new T.Vector2().fromArray([centerX1, centerY1]),
        new T.Vector2().fromArray([centerX2, centerY2])
    ];
}

/**
 * returns a vector that is orthogonal to a given one
 */
function ortho({x,y}: T.Vector2) : T.Vector2 {
    return new T.Vector2(-y, x).normalize();
}

export {
    findCircleCenter,
    ortho
}