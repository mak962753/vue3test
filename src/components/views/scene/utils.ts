import * as THREE from "three";

function rotate(object: THREE.Object3D, axis: THREE.Vector3, radians: number) {
    const rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    const currentPos = new THREE.Vector4(object.position.x, object.position.y, object.position.z, 1);
    const newPos = currentPos.applyMatrix4(rotWorldMatrix);

    rotWorldMatrix.multiply(object.matrix);
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);

    object.position.x = newPos.x;
    object.position.y = newPos.y;
    object.position.z = newPos.z;
}
const YAxis = new THREE.Vector3(0, 1, 0);

export {
    rotate,
    YAxis
}
