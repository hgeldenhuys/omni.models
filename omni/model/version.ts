import {VersionInterface} from "omni.interfaces/interfaces/version";

export default class Version implements VersionInterface {
    major: number;
    minor: number;
    patch: number;
    constructor(version: VersionInterface) {
        this.major = version.major;
        this.minor = version.minor;
        this.patch = version.patch;
    }
    toString() {
        return `${this.major}.${this.minor}.${this.patch}`;
    }
}
