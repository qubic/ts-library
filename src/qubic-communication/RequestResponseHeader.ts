import { IQubicBuildPackage } from "../qubic-types/IQubicBuildPackage";

export class RequestResponseHeader implements IQubicBuildPackage {
    private size: number = 0;
    private type: number = 0;
    private dejaVu: number = 0;

    /**
     * 
     * @param packageType type of the package to send (use QubicPackagetypes statics)
     * @param packageSize size of the qubic package (header size is added automatically)
     */
    constructor(packageType: number | undefined = undefined, packageSize: number | undefined = undefined){
        if(packageType !== undefined){
            this.setType(packageType)
        }
        if(packageSize !== undefined){
            this.setSize(packageSize + this.getPackageSize())
        }else {
            this.setSize(this.getPackageSize());
        }
    }

    setType(t: number): RequestResponseHeader{
        this.type = t;
        return this;
    }
    getType(): number{
        return this.type;
    }
    setSize(t: number): RequestResponseHeader{
        this.size = t;
        return this;
    }
    getSize(): number{
        return this.size;
    }
    setDejaVu(t: number): RequestResponseHeader{
        this.dejaVu = t;
        return this;
    }
    getDejaVu(): number{
        return this.dejaVu;
    }
    randomizeDejaVu() {
        this.dejaVu= Math.floor(Math.random() * 2147483647);
    }

    getPackageSize(): number {
        return this.getPackageData().length;
    }

    parse(data: Uint8Array): RequestResponseHeader | undefined {
        if(data.length < 8)
        {
            console.error("INVALID PACKAGE SIZE")
            return undefined;
        }
        this.setSize((data[2] << 16) | (data[1] << 8) | data[0]);
        this.setType(data[3]);

        this.setDejaVu((data[2] << 24) | (data[2] << 16) | (data[1] << 8) | data[0]);
        return this;
    }

    getPackageData(): Uint8Array {

        // validation of packet
        if(this.size > 16777215){
            throw new Error("Size cannot be >16777215"); 
        }
        if(this.type > 255 || this.type < 0){
            throw new Error("Type must be between 0 and 255"); 
        }

        var bytes = new Uint8Array(8).fill(0);
        let offset = 0;
        // generate size
        bytes[offset++] = this.size;
        bytes[offset++] = (this.size >> 8);
        bytes[offset++] = (this.size >> 16);

        bytes[offset++] = this.type;


        bytes[offset++] = this.dejaVu;
        bytes[offset++] = (this.dejaVu >> 8);
        bytes[offset++] = (this.dejaVu >> 16);
        bytes[offset++] = (this.dejaVu >> 24);

        return bytes;
    }
}