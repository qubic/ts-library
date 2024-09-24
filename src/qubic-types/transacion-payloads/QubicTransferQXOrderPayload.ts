/**
 *
 * Transaction Payload to create bid / ask orders on QX SC
 *
 * struct qxOrderAction_input {
 *     uint8_t issuer[32];
 *     uint64_t assetName;
 *     long long price;
 *     long long numberOfShares;
 * }
 *
 */
import {IQubicBuildPackage} from "../IQubicBuildPackage";
import {PublicKey} from "../PublicKey";
import {Long} from "../Long";
import {QubicPackageBuilder} from "../../QubicPackageBuilder";
import {DynamicPayload} from "../DynamicPayload";

export class QubicTransferQXOrderPayload implements IQubicBuildPackage {

    private _internalPackageSize = 56;// 32 + 8 + 8 + 8 -> 56

    private qxOrderActionInput: QXOrderActionInput;

    constructor(actionInput: QXOrderActionInput) {
        this.qxOrderActionInput = actionInput;
    }

    getPackageSize(): number {
        return this._internalPackageSize;
    }
    getPackageData(): Uint8Array {
        const builder = new QubicPackageBuilder(this.getPackageSize());

        builder.add(this.qxOrderActionInput.issuer)
        builder.add(this.qxOrderActionInput.assetName)
        builder.add(this.qxOrderActionInput.price)
        builder.add(this.qxOrderActionInput.numberOfShares)

        return builder.getData();
    }

    getTransactionPayload(): DynamicPayload {
        const payload = new DynamicPayload(this.getPackageSize());
        payload.setPayload(this.getPackageData());
        return payload;
    }

    getTotalAmount(): bigint {
        return BigInt(this.qxOrderActionInput.price.getNumber() * this.qxOrderActionInput.numberOfShares.getNumber())
    }
}

export interface QXOrderActionInput {
    issuer: PublicKey
    assetName: Long
    price: Long
    numberOfShares: Long
}
