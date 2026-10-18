import { IQubicBuildPackage } from "../qubic-types/IQubicBuildPackage";

export class RequestContractFunction implements IQubicBuildPackage {
    private _internalPackageSize = 8;
    private bytes: Uint8Array;

    constructor(contractIndex: number = 0, inputType: number = 0, inputSize: number = 0) {
        this.bytes = new Uint8Array(this._internalPackageSize);
        const view = new DataView(this.bytes.buffer);
        view.setUint32(0, contractIndex, true);
        view.setUint16(4, inputType, true);
        view.setUint16(6, inputSize, true);
    }

    public getContractIndex(): number {
        const view = new DataView(this.bytes.buffer);
        return view.getUint32(0, true);
    }

    public getInputType(): number {
        const view = new DataView(this.bytes.buffer);
        return view.getUint16(4, true);
    }

    public getInputSize(): number {
        const view = new DataView(this.bytes.buffer);
        return view.getUint16(6, true);
    }

    public setContractIndex(contractIndex: number): void {
        const view = new DataView(this.bytes.buffer);
        view.setUint32(0, contractIndex, true);
    }

    public setInputType(inputType: number): void {
        const view = new DataView(this.bytes.buffer);
        view.setUint16(4, inputType, true);
    }

    public setInputSize(inputSize: number): void {
        const view = new DataView(this.bytes.buffer);
        view.setUint16(6, inputSize, true);
    }

    public getPackageSize(): number {
        return this._internalPackageSize;
    }

    public getPackageData(): Uint8Array {
        return this.bytes;
    }
}