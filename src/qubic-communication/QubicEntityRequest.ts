import { IQubicBuildPackage } from "../qubic-types/IQubicBuildPackage";
import { Long } from "../qubic-types/Long";
import { QubicPackageBuilder } from "../QubicPackageBuilder";
import { PublicKey } from "../qubic-types/PublicKey";
import { QubicDefinitions } from "../QubicDefinitions";


/**
 * typedef struct
* {
*     unsigned char publicKey[32];
* } RequestedEntity;
 */
export class QubicEntityRequest implements IQubicBuildPackage {

    private _internalPackageSize = 32;

    private publicKey: PublicKey = new PublicKey();
 

    public getPublicKey(): PublicKey {
        return this.publicKey;
    }

    public setPublicKey(publicKey: PublicKey): void {
        this.publicKey = publicKey;
    }

    constructor(publicKey: PublicKey | undefined){
        if(publicKey !== undefined)
            this.setPublicKey(publicKey);
    }

    getPackageSize(): number {
        return this.getPackageData().length;
    }

    parse(data: Uint8Array): QubicEntityRequest | undefined {
        if(data.length !== this._internalPackageSize)
        {
            console.error("INVALID PACKAGE SIZE")
            return undefined;
        }
        this.setPublicKey(new PublicKey(data.slice(0, QubicDefinitions.PUBLIC_KEY_LENGTH)));
        return this;
    }

    getPackageData(): Uint8Array {
        const builder = new QubicPackageBuilder(this._internalPackageSize);
        builder.add(this.publicKey);        
        return builder.getData();
    }
}