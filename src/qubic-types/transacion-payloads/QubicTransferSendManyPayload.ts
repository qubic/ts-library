import { QubicDefinitions } from "../../QubicDefinitions";
import { QubicPackageBuilder } from "../../QubicPackageBuilder";
import { QubicHelper } from "../../qubicHelper";
import { DynamicPayload } from "../DynamicPayload";
import { IQubicBuildPackage } from "../IQubicBuildPackage";
import { Long } from "../Long";
import { PublicKey } from "../PublicKey";

/**
 *
 * Transaction Payload to use Qutil/SendMany SC
 *
 * struct SendToManyV1_input {
 *   uint8_t addresses[25][32];
 *   int64_t amounts[25];
 * };
 *
 *
 *
 */
export class QubicTransferSendManyPayload implements IQubicBuildPackage {
  private _internalPackageSize = 1000; /* 25 * 32  + 25 * 8 */

  // max 25 transfers allowed
  private sendManyTransfers: SendManyTransfer[] = [];

  constructor() { }

  addTransfer(transfer: SendManyTransfer): QubicTransferSendManyPayload {
    if (this.sendManyTransfers.length < 25) {
      this.sendManyTransfers.push(transfer);
    } else {
      throw new Error("max 25 send many transfers allowed");
    }
    return this;
  }

  addTranfers(transfers: SendManyTransfer[]): QubicTransferSendManyPayload {
    if (this.sendManyTransfers.length + transfers.length > 25) {
      throw new Error("max 25 send many transfers allowed");
    }
    transfers.forEach((transfer) => {
      this.addTransfer(transfer);
    });
    return this;
  }

  /**
   * 
   * @returns the transfers for this send many request
   */
  getTransfers(): SendManyTransfer[] {
    return this.sendManyTransfers;
  }

  /**
   * the acumulated amount of all transfers
   * @returns 
   * 
   */
  getTotalAmount(): bigint {
    return this.sendManyTransfers.reduce(
      (a, b) => (a += b && b.amount ? b.amount.getNumber() : BigInt(0)),
      BigInt(0)
    );
  }

  getPackageSize(): number {
    return this._internalPackageSize;
  }

  getPackageData(): Uint8Array {
    const builder = new QubicPackageBuilder(this.getPackageSize());
    for (let i = 0; i < 25; i++) {
      if (
        this.sendManyTransfers.length > i &&
        this.sendManyTransfers[i].amount.getNumber() > 0
      ) {
        builder.add(this.sendManyTransfers[i].destId);
      } else {
        builder.add(new PublicKey(QubicDefinitions.EMPTY_ADDRESS)); // add empty address to have 0 in byte
      }
    }
    for (let i = 0; i < 25; i++) {
      if (
        this.sendManyTransfers.length > i &&
        this.sendManyTransfers[i].amount.getNumber() > 0
      ) {
        const amount = this.sendManyTransfers[i].amount;
        if (typeof amount === "number") {
          builder.add(new Long(amount));
        } else {
          builder.add(amount);
        }
      } else {
        builder.add(new Long(0));
      }
    }
    return builder.getData();
  }

  getTransactionPayload(): DynamicPayload {
    const payload = new DynamicPayload(this.getPackageSize());
    payload.setPayload(this.getPackageData());
    return payload;
  }

  /**
   * parses raw binary package to js object
   * @param data raw send many input (payload)
   * @returns QubicTransferSendManyPayload
   */
  async parse(data: Uint8Array): Promise<QubicTransferSendManyPayload> {
    if (data.length !== this._internalPackageSize) {
      console.error("INVALID PACKAGE SIZE");
      return undefined;
    }

    const helper = new QubicHelper();

    const sendManyTransfers: SendManyTransfer[] = [];

    // a send many tx can have maximum 25 recipients
    for (let i = 0; i < 25; i++) {
      // get the amount for the transfer
      const amount = new Long(data.slice(800 + i * 8, 800 + i * 8 + 8));
      // only add transfer to output array if amount > 0; 0 or lower means, no transfer
      if (amount.getNumber() > 0) {
        const dest = data.slice(32 * i, 32 * i + 32);
        this.sendManyTransfers.push({
          amount: amount,
          destId: new PublicKey(await helper.getIdentity(dest)),
        });
      }
    }

    this.addTranfers(sendManyTransfers);

    return this;
  }
}

/**
 * interface for one send many transer
 */
export interface SendManyTransfer {
  destId: PublicKey;
  amount: Long;
}
