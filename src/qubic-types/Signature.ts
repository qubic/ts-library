import { IQubicBuildPackage } from "./IQubicBuildPackage";
import { QubicDefinitions } from "../QubicDefinitions";

export class Signature implements IQubicBuildPackage {
    private bytes: Uint8Array = new Uint8Array(QubicDefinitions.SIGNATURE_LENGTH).fill(0);

    constructor(data: Uint8Array | undefined = undefined){
        if(data){
            this.setSignature(data);
        }
    }

    setSignature(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    getPackageData() {
        return this.bytes;
    }

    getPackageSize(): number {
        return this.bytes.length;
    }
}