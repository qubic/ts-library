import { QubicHelper } from "../qubicHelper";
import { DynamicPayload } from "./DynamicPayload";
import { IQubicBuildPackage } from "./IQubicBuildPackage";
import { Long } from "./Long";
import { QubicPackageBuilder } from "../QubicPackageBuilder";
import { PublicKey } from "./PublicKey";
import { QubicDefinitions } from "../QubicDefinitions";
import { Signature } from "./Signature";

/**
 * C+S Struct
 * typedef struct
 * {
 *  unsigned char sourcePublicKey[32];
 *  unsigned char destinationPublicKey[32];
 *  long long amount;
 *  unsigned int tick;
 *  unsigned short inputType;
 *  unsigned short inputSize;
 * } Transaction;
 */
export class QubicTransaction implements IQubicBuildPackage {

    private builtData: Uint8Array | undefined;
    public digest: Uint8Array | undefined;
    public id: string | undefined;


    // todo: create getter/setter

    public sourcePublicKey: PublicKey = new PublicKey();
    public destinationPublicKey: PublicKey = new PublicKey();
    public amount: Long = new Long();
    public tick: number = 0;
    public inputType: number = 0;
    public inputSize: number = 0;

    public payload: IQubicBuildPackage = new DynamicPayload(QubicDefinitions.MAX_TRANSACTION_SIZE);
    public signature: Signature = new Signature();
    

    public setSourcePublicKey(p: PublicKey | string): QubicTransaction {
        if (p instanceof PublicKey)
            this.sourcePublicKey = p;
        else
            this.sourcePublicKey = new PublicKey(p);
        return this;
    }
    public setDestinationPublicKey(p: PublicKey | string): QubicTransaction {
        if (p instanceof PublicKey)
            this.destinationPublicKey = p;
        else
            this.destinationPublicKey = new PublicKey(p);
        return this;
    }
    public setAmount(p: Long | number): QubicTransaction {
        if (p instanceof Long)
            this.amount = p;
        else
            this.amount = new Long(p);
        return this;
    }
    public setTick(p: number): QubicTransaction {
        this.tick = p;
        return this;
    }
    public setInputType(p: number): QubicTransaction {
        this.inputType = p;
        return this;
    }
    public setInputSize(p: number): QubicTransaction {
        this.inputSize = p;
        return this;
    }

    public setPayload(payload: DynamicPayload | IQubicBuildPackage): QubicTransaction {
        this.payload = payload;
        this.inputSize = this.payload.getPackageSize();
        return this;
    }

    public getPayload(): IQubicBuildPackage {
        return this.payload;
    }

    private _internalSize() {
        return this.sourcePublicKey.getPackageSize()
            + this.destinationPublicKey.getPackageSize()
            + this.amount.getPackageSize()
            + 4 // tick
            + 2 // inputType
            + 2 // inputSize
            + this.inputSize
            + this.signature.getPackageSize()
            ;
    }

    public getPackageSize(): number {
        return this._internalSize();
    }

    public getId(): string {
        if (!this.id) {
            console.error("CALL build() BEFORE USING getId() METHOD");
            return "";
        }
        return this.id;
    }

    /**
     * builds the transaction to be sent
     * includes signing with seed 
     * 
     * @param seed the seed to be used to sign this transacion. the seed should be the same as the sourcePublicKey
     * @returns a complete transaction package
     */
    public async build(seed: string): Promise<Uint8Array> {
        this.builtData = undefined;
        var builder = new QubicPackageBuilder(this._internalSize());
        builder.add(this.sourcePublicKey);
        builder.add(this.destinationPublicKey);
        builder.add(this.amount);
        builder.addInt(this.tick);
        builder.addShort(this.inputType);
        builder.addShort(this.inputSize);
        builder.add(this.payload);
        const { signedData, digest, signature} =  await builder.signAndDigest(seed);
        this.builtData = signedData;
        this.digest = digest;
        this.signature = new Signature(signature)
        this.id = await new QubicHelper().getHumanReadableBytes(digest);
        return signedData;
    }

    /**
     * The result of build() must be passed through this function,
     * as the `broadcast-transaction` endpoint expects the transaction to be Base64 encoded.
     */
    encodeTransactionToBase64(transaction: Uint8Array): string {
        const byteArray = new Uint8Array(transaction);
        const str = String.fromCharCode.apply(null, byteArray);
        return btoa(str);
    }

    getPackageData(): Uint8Array {
        if (!this.builtData) {
            console.error("CALL build() BEFORE USING getPackageData() METHOD");
        }
        return this.builtData ?? new Uint8Array();
    }

}