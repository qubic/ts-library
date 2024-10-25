import { QubicDefinitions } from "../../QubicDefinitions";
import { QubicPackageBuilder } from "../../QubicPackageBuilder";
import { DynamicPayload } from "../DynamicPayload";
import { IQubicBuildPackage } from "../IQubicBuildPackage";
import { Long } from "../Long";
import { PublicKey } from "../PublicKey";
import { QubicHelper } from "../../qubicHelper";

/**
 * 
 * Transaction Payload to transfer an Asset
 * 
 * typedef struct
* {
*     uint8_t issuer[32];
*     uint8_t newOwnerAndPossessor[32];
*     unsigned long long assetName;
*     long long numberOfUnits;
* } TransferAssetOwnershipAndPossession_input;
 * 
 * 
 * 
 */
export class QubicTransferAssetPayload implements IQubicBuildPackage {

    private _internalPackageSize = 32 + 32 + 8 + 8;

    private issuer: PublicKey;
    private newOwnerAndPossessor: PublicKey;
    private assetName: Uint8Array;
    private numberOfUnits: Long;


    constructor() {
    }

    // todo: think about adding getters

    setIssuer(issuer: PublicKey | string): QubicTransferAssetPayload {
        if (typeof issuer === "string") {
            this.issuer = new PublicKey(issuer);
        } else {
            this.issuer = <PublicKey>issuer;
        }
        return this;
    }


    setNewOwnerAndPossessor(newOwnerAndPossessor: PublicKey | string): QubicTransferAssetPayload {
        if (typeof newOwnerAndPossessor === "string") {
            this.newOwnerAndPossessor = new PublicKey(newOwnerAndPossessor);
        } else {
            this.newOwnerAndPossessor = <PublicKey>newOwnerAndPossessor;
        }
        return this;
    }

    setAssetName(assetName: Uint8Array | string): QubicTransferAssetPayload {
        if (typeof assetName === "string") {
            const utf8Encode = new TextEncoder();
            const nameBytes = utf8Encode.encode(assetName)
            this.assetName = new Uint8Array(8);
            nameBytes.forEach((b, i) => {
                this.assetName[i] = b;
            });
        } else {
            this.assetName = <Uint8Array>assetName;
        }
        return this;
    }

    getAssetName(): Uint8Array {
        return this.assetName;
    }

    getIssuer(): PublicKey {
        return this.issuer;
    }

    getNewOwnerAndPossessor(): PublicKey {
        return this.newOwnerAndPossessor;
    }

    getNumberOfUnits(): Long {
        return this.numberOfUnits;
    }

    setNumberOfUnits(numberOfUnits: number | Long): QubicTransferAssetPayload {
        if (typeof numberOfUnits === "number") {
            this.numberOfUnits = new Long(numberOfUnits);
        } else {
            this.numberOfUnits = <Long>numberOfUnits;
        }
        return this;
    }

    getPackageSize(): number {
        return this._internalPackageSize;
    }

    getPackageData(): Uint8Array {
        const builder = new QubicPackageBuilder(this.getPackageSize());
        builder.add(this.issuer);
        builder.add(this.newOwnerAndPossessor);
        builder.addRaw(this.assetName);
        builder.add(this.numberOfUnits);
        return builder.getData();
    }

    getTransactionPayload(): DynamicPayload {
        const payload = new DynamicPayload(this.getPackageSize());
        payload.setPayload(this.getPackageData());
        return payload;
    }

    async parse(data: Uint8Array): Promise<QubicTransferAssetPayload> {
        if (data.length !== this._internalPackageSize) {
            console.error("INVALID PACKAGE SIZE");
            return undefined;
        }

        const helper = new QubicHelper();

        let start = 0;
        let end = 32; // size for issuer and newOwnerAndPossessor

        this.issuer = new PublicKey(await helper.getIdentity(data.slice(start, end)));

        start = end;
        end = start + 32; // size for newOwnerAndPossessor
        this.newOwnerAndPossessor = new PublicKey(await helper.getIdentity(data.slice(start, end)));

        start = end;
        end = start + 8; // size for asset name
        this.assetName = data.slice(start, end);

        let decoder = new TextDecoder(); // Create a TextDecoder for UTF-8 by default
        const result = decoder.decode(this.assetName); // Convert Uint8Array to string

        start = end;
        end = start + 8; // size for number of units

        this.numberOfUnits = new Long(data.slice(start, end));

        return this;
    }

}