import * as THREE from "three";


interface ConfigMenuItem {
    itemTitle: string;
    itemText: string;
    iconUrl: string;
    styles: {k:string, v:string}[];
}
interface LogoConfig {
    initialRotation: THREE.Vector3,
    rotationSpeed: THREE.Vector3,
    durationMoveToBg: number,
    durationRotation: number
}

interface StoneGroupConfig {
    offsets: THREE.Vector3[];
    rotationAxis: THREE.Vector3;
    rotationSpeed: number;
    rotationRadius: number;
    centerLocalRotationAngles: THREE.Vector3,
    centerGlobalRotationAngle: number,
    centerOffsets: THREE.Vector3,
    menuItems: ConfigMenuItem[];
    durationCollapseExpand: number,
    durationRotation: number,
    durationMoveToBg: number,
    durationMoveToCenter: number
}

interface StoneGroupConfig {
    menuItems: ConfigMenuItem[]
}

const Stone2Defaults: StoneGroupConfig = {
    offsets: [
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(0, 1, 0)
    ],
    rotationAxis: new THREE.Vector3(0.2, 0, 0), //new THREE.Vector3(0.1, 1, 0.3)
    rotationSpeed: 0.0075,
    rotationRadius: 5,
    centerLocalRotationAngles: new THREE.Vector3(0, Math.PI/4, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2,
    centerOffsets: new THREE.Vector3(0,0.5,0),
    menuItems: [],
    durationCollapseExpand: 300,
    durationRotation: 800,
    durationMoveToBg: 600,
    durationMoveToCenter: 300
};

const Stone3Defaults: StoneGroupConfig = {
    offsets: [
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(-1, -1, -1)
    ],
    rotationAxis: new THREE.Vector3(0, 1, 0),
    rotationSpeed: 0.005,
    rotationRadius: 3,
    centerLocalRotationAngles: new THREE.Vector3(0, Math.PI/2, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2,
    centerOffsets: new THREE.Vector3(0,-1, 3),
    menuItems: [],
    durationCollapseExpand: 300,
    durationRotation: 800,
    durationMoveToBg: 600,
    durationMoveToCenter: 300
};



const Stone4Defaults: StoneGroupConfig = {
    menuItems: [],
    offsets: [
        new THREE.Vector3(-1, 1, -1.5),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, -0.5, -1.5),
        new THREE.Vector3(1, -1, 1)
    ],
    rotationAxis: new THREE.Vector3(0.7, 0, 0.3),
    rotationSpeed: 0.0085,
    rotationRadius: 6.5,
    centerLocalRotationAngles: new THREE.Vector3(0,  3.1415+ -0.5, 0),
    centerGlobalRotationAngle: Math.PI + Math.PI/2,
    centerOffsets: new THREE.Vector3(0, 1.5, 0),
    durationCollapseExpand: 300,
    durationRotation: 800,
    durationMoveToBg: 600,
    durationMoveToCenter: 300

};


class Config {
    constructor(private stoneGroupConfigs: Map<string, StoneGroupConfig>, public logoConfig: LogoConfig) {
    }
    getStoneGroupConfig(childCount: number): StoneGroupConfig {
        let x = this.stoneGroupConfigs.get(String(childCount));
        if (!x && childCount === 4) return Stone4Defaults;
        if (!x && childCount === 3) return Stone3Defaults;
        if (!x && childCount === 2) return Stone2Defaults;
        if (!x)
            throw new Error('Could not find config for a group.')
        return x;
    }
}

async function readConfig() : Promise<Config> {
    const x = await readJson('/assets/scene/params.json');
    const {
        stoneGroups, logo: {
            initialRotation,
            rotationSpeed
        }, durations: {
            collapseExpand: durationCollapseExpand,
            rotation: durationRotation,
            moveToBg: durationMoveToBg,
            moveToCenter: durationMoveToCenter
        }
    } = x;

    const logoConfig: LogoConfig = {
        durationMoveToBg,
        durationRotation,
        initialRotation: new THREE.Vector3().fromArray(initialRotation),
        rotationSpeed: new THREE.Vector3().fromArray(rotationSpeed)
    };

    const stoneGroupConfigs = new Map<string, StoneGroupConfig>();
    for (let p in stoneGroups) {
        const stoneGroup = stoneGroups[p];
        const {centerGlobalRotationAngle,
            centerLocalRotationAngles,
            centerOffsets,
            menuItems,
            offsets,
            rotationAxis,
            rotationRadius,
            rotationSpeed
        } = stoneGroup;
        const g: StoneGroupConfig = {
            centerGlobalRotationAngle,
            centerLocalRotationAngles: new THREE.Vector3().fromArray(centerLocalRotationAngles),
            centerOffsets: new THREE.Vector3().fromArray(centerOffsets),
            menuItems: menuItems as ConfigMenuItem[],
            offsets: (offsets as (number[])[]).map(i => new THREE.Vector3().fromArray(i)),
            rotationAxis: new THREE.Vector3().fromArray(rotationAxis),
            rotationRadius,
            rotationSpeed,
            durationCollapseExpand,
            durationRotation,
            durationMoveToBg,
            durationMoveToCenter
        };
        stoneGroupConfigs.set(p, g);
    }

    return new Config(stoneGroupConfigs, logoConfig);
}

function readJson(url: string): Promise<any> {
    return new Promise<any>((y,n)=> {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                y(JSON.parse(request.responseText));
            } else {
                // We reached our target server, but it returned an error
                n(new Error());
            }
        };
        request.onerror = function(err) {
            // There was a connection error of some sort
            n(err);
        };
        request.send();
    });
}

export {
    readConfig,
    Config,
    LogoConfig,
    StoneGroupConfig
}