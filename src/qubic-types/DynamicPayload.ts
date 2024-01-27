import { QubicDefinitions } from "../QubicDefinitions";

export class DynamicPayload {
    private bytes: Uint8Array;
    private filledSize: number = 0;
    private maxSize: number = 0;

    /**
     * Create a dynamic payload
     * the maxSize should be set to the max expected size for this paload.
     */
    constructor(maxSize: number) {
        this.bytes = new Uint8Array(maxSize).fill(0)
        this.maxSize = maxSize;
    }

    setPayload(data: Uint8Array): void {
        if(data.length > this.maxSize)
            throw new Error("data must be lower or equal " + this.maxSize); 

        this.bytes = data;
        this.filledSize = this.bytes.length;
    }

    getPackageData(): Uint8Array {
        if(this.filledSize == 0)
            return new Uint8Array(0);
        return this.bytes;
    }

    getPackageSize() {
        return this.filledSize;
    }
    
}