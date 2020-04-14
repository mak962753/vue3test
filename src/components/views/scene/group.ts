import * as THREE from "three";

abstract class Group {
    abstract animate():void;
    abstract runAction(name: string, params?: any): Promise<any>;
    abstract isIntersected(rayCaster: THREE.Raycaster): boolean;
}

export {
    Group
}