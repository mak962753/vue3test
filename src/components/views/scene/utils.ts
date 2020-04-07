import * as THREE from "three";
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

function rotate(object: THREE.Object3D, axis: THREE.Vector3, radians: number) {
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis/*.normalize()*/, radians);

    const currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
    const newPos = currentPos.applyMatrix4(rotWorldMatrix);

    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    //object.rotation.setFromRotationMatrix(object.matrix);

    object.position.x = newPos.x;
    object.position.y = newPos.y;
    object.position.z = newPos.z;
}



function isInsideMat(name: string): boolean {
    return !!name.match(/stone\d?_inside_mat/i);
}

function loadGlb(url: string): Promise<GLTF> {
    return new Promise((ok, err) => {
        const loader = new GLTFLoader();
        loader.load(url, (gltf: GLTF) => {
            ok(gltf);
        }, (/*progressEvent: ProgressEvent*/) => {

        }, (errorEvent: ErrorEvent) => {
            err(errorEvent);
        });
    });
}
export {
    rotate,
    isInsideMat,
    loadGlb
}
