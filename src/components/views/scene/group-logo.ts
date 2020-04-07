import {Group} from "./group";
import * as THREE from "three";

export class GroupLogo extends Group {

    constructor(private scene: THREE.Object3D) {
        super();
        this.scene.rotation.x += 0.5;
    }

    animate(): void {
        this.scene.rotation.y += 0.003;
    }

    getIntersected(rayCaster: THREE.Raycaster): THREE.Object3D | null {
        return null;
    }

    async runAction(name: string): Promise<any> {
    }

}