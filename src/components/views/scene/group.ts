import * as THREE from "three";

abstract class Group {
    abstract animate():void;

    abstract runAction(name: string, params?: any): Promise<any>;

    abstract getIntersected(raycaster: THREE.Raycaster): THREE.Object3D|null;
}

export {
    Group
}