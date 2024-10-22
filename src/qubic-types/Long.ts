import { IQubicBuildPackage } from "./IQubicBuildPackage";

export class Long implements IQubicBuildPackage {
    private value: bigint = BigInt(0);

    constructor(initialValue: number | bigint | Uint8Array | undefined = 0) {
        if (typeof initialValue === "number") {
            this.setNumber(initialValue);
        } else if (initialValue instanceof Uint8Array) {
            const view = new DataView(initialValue.buffer, 0);
            this.setNumber(view.getBigUint64(0, true));
        } else if (initialValue !== undefined) {
            this.setNumber(initialValue);
        }
    }
    setNumber(n: number | bigint) {
        if (typeof n === "number")
            this.value = BigInt(n);
        else
            this.value = n;
    }
    getNumber(): bigint {
        return this.value;
    }

    getPackageSize() {
        return 8; // fixed size 
    }

    getPackageData(): Uint8Array {
        let buffer = new ArrayBuffer(8);
        let dataview = new DataView(buffer);
        dataview.setBigInt64(0, this.value, true);
        return new Uint8Array(buffer);
    }


}