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

function toScreenXY (position: THREE.Vector3, clientWidth: number, clientHeight: number, camera: THREE.PerspectiveCamera) {
    const pos = position.clone();
    const projScreenMat = new THREE.Matrix4();
    projScreenMat.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse);
    pos.applyMatrix4(projScreenMat);
    return {
        x: ( pos.x + 1 ) * clientWidth / 2, // jqdiv.width() / 2 + jqdiv.offset().left,
        y: ( - pos.y + 1) * clientHeight / 2 // jqdiv.height() / 2 + jqdiv.offset().top
    };
}

function getVectorAngles(v: THREE.Vector3): THREE.Vector3 {
    const V1x = new THREE.Vector3(1, 0, 0);
    const V1y = new THREE.Vector3(0, 1, 0);
    const V1z = new THREE.Vector3(0, 0, 1);

    const V2xz = new THREE.Vector3(v.x, 0, v.z).normalize();
    const V2xy = new THREE.Vector3(v.x, v.y, 0).normalize();

    return new THREE.Vector3(
        //angle in radian between origin X axis and X axis of V2
        Math.acos(V1x.dot(V2xz)),
        //angle in radian between origin Y axis and Y axis of V
        Math.acos(V1y.dot(V2xy)),
        //angle in radian between origin Z axis and Z axis of V
        Math.acos(V1z.dot(V2xz))
    );
}

export {
    rotate,
    toScreenXY,
    isInsideMat,
    loadGlb
}
