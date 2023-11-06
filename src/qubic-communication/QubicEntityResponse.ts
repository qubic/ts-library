import { IQubicBuildPackage } from "../qubic-types/IQubicBuildPackage";
import { Long } from "../qubic-types/Long";
import { QubicPackageBuilder } from "../QubicPackageBuilder";
import { PublicKey } from "../qubic-types/PublicKey";
import { QubicEntity } from "../qubic-types/QubicEntity";


/**
 * typedef struct
 * {
 *     unsigned char publicKey[32];
 *     long long incomingAmount, outgoingAmount;
 *     unsigned int numberOfIncomingTransfers, numberOfOutgoingTransfers;
 *     unsigned int latestIncomingTransferTick, latestOutgoingTransferTick;
 *     unsigned int tick;
 *     int spectrumIndex;
 *     unsigned char siblings[SPECTRUM_DEPTH][32];
 * } RespondedEntity;
 */
export class QubicEntityResponse implements IQubicBuildPackage {

    private _internalPackageSize = 840;

    private entity: QubicEntity = new QubicEntity();
    private tick: number = 0;
    private spectrumIndex: number = 0;
    private siblings: Uint8Array = new Uint8Array();

    public getEntity(): QubicEntity {
        return this.entity;
    }

    public setEntity(entity: QubicEntity): void {
        this.entity = entity;
    }
    public getTick(): number {
        return this.tick;
    }

    public setTick(tick: number): void {
        this.tick = tick;
    }

    public getSpectrumIndex(): number {
        return this.spectrumIndex;
    }

    public setSpectrumIndex(spectrumIndex: number): void {
        this.spectrumIndex = spectrumIndex;
    }

    public getSiblings(): Uint8Array {
        return this.siblings;
    }

    public setSiblings(siblings: Uint8Array): void {
        this.siblings = siblings;
    }

    constructor(){
    }


    getPackageSize(): number {
        return this.getPackageData().length;
    }

    parse(data: Uint8Array): QubicEntityResponse | undefined {
        if(data.length !== this._internalPackageSize)
        {
            console.error("INVALID PACKAGE SIZE")
            return undefined;
        }
        const dataView = new DataView(data.buffer);
        let offset = 0;
        const entity = new QubicEntity();
        if(entity.parse(data.slice(0, entity.getPackageSize())) !== undefined)
        {
            this.setEntity(entity);
            offset += entity.getPackageSize();

            this.setTick(dataView.getInt32(offset, true));
            offset += 4;
            this.setSpectrumIndex(dataView.getInt16(offset, true));
            offset += 4;
            this.setSiblings(data.slice(offset));
        }
        return this;
    }

    getPackageData(): Uint8Array {
        const builder = new QubicPackageBuilder(this._internalPackageSize);
        builder.add(this.entity);
        builder.addInt(this.tick);
        builder.addInt(this.spectrumIndex);
        builder.addRaw(this.siblings);
        return builder.getData();
    }
}