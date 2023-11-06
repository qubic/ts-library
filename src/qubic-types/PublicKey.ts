import { KeyHelper } from "../keyHelper";
import { IQubicBuildPackage } from "./IQubicBuildPackage";
import { QubicDefinitions } from "../QubicDefinitions";

export class PublicKey implements IQubicBuildPackage {
    private bytes: Uint8Array = new Uint8Array(QubicDefinitions.PUBLIC_KEY_LENGTH).fill(0);
    private identity: string | undefined = undefined;

    constructor(identity: string | Uint8Array | undefined = undefined) {
        if (typeof identity === "string") {
            this.setIdentityFromString(identity);
        } else if (identity !== undefined) {
            this.setIdentity(identity);
        }
    }

    setIdentityFromString(id: string) {
        this.identity = id;
        this.setIdentity(KeyHelper.getIdentityBytes(id));
    }

    setIdentity(bytes: Uint8Array) {
        this.bytes = bytes;
    }

    getIdentity() {
        return this.bytes;
    }
    getIdentityAsSring(): string | undefined {
        return this.identity;
    }

    getPackageSize(): number {
        return this.bytes.length;
    }

    getPackageData(): Uint8Array {
        return this.bytes;
    }

    equals(compare: PublicKey): boolean {
      return compare && this.bytes.length === compare.bytes.length && this.bytes.every((value, index) => value === compare.bytes[index]);
    }
}