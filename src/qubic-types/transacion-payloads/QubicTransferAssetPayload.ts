import { QubicDefinitions } from "../../QubicDefinitions";
import { QubicPackageBuilder } from "../../QubicPackageBuilder";
import { DynamicPayload } from "../DynamicPayload";
import { IQubicBuildPackage } from "../IQubicBuildPackage";
import { Long } from "../Long";
import { PublicKey } from "../PublicKey";


/**
 * 
 * Transaction Payload to transfer an Asset
 * 
 * typedef struct
* {
*     uint8_t issuer[32];
*     uint8_t possessor[32];
*     uint8_t newOwner[32];
*     unsigned long long assetName;
*     long long numberOfUnits;
* } TransferAssetOwnershipAndPossession_input;
 * 
 * 
 * 
 */
export class QubicTransferAssetPayload implements IQubicBuildPackage {

    private _internalPackageSize = 32 + 32 + 32 + 8 + 8;

    private issuer: PublicKey;
    private possessor: PublicKey;
    private newOwner: PublicKey;
    private assetName: Long;
    private numberOfUnits: Long;


    constructor() {
    }

    // todo: think about adding getters

    setIssuer(issuer: PublicKey | string): QubicTransferAssetPayload {
        if (typeof issuer === "string") {
            this.issuer = new PublicKey(issuer);
        }else{
            this.issuer = <PublicKey>issuer;
        }
        return this;
    }

    setPossessor(possessor: PublicKey | string): QubicTransferAssetPayload {
        if (typeof possessor === "string") {
            this.possessor = new PublicKey(possessor);
        }else{
            this.possessor = <PublicKey>possessor;
        }
        return this;
    }

    setnewOwner(newOwner: PublicKey | string): QubicTransferAssetPayload {
        if (typeof newOwner === "string") {
            this.newOwner = new PublicKey(newOwner);
        }else{
            this.newOwner = <PublicKey>newOwner;
        }
        return this;
    }

    setAssetName(assetName: number | Long): QubicTransferAssetPayload {
        if (typeof assetName === "number") {
            this.assetName = new Long(assetName);
        }else{
            this.assetName = <Long>assetName;
        }
        return this;
    }

    setNumberOfUnits(numberOfUnits: number | Long): QubicTransferAssetPayload {
        if (typeof numberOfUnits === "number") {
            this.numberOfUnits = new Long(numberOfUnits);
        }else{
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
        builder.add(this.possessor);
        builder.add(this.newOwner);
        builder.add(this.assetName);
        builder.add(this.numberOfUnits);
        return builder.getData();
    }

    getTransactionPayload(): DynamicPayload {
        const payload = new DynamicPayload(this.getPackageSize());
        payload.setPayload(this.getPackageData());
        return payload;
    }
}