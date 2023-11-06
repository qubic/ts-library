import { IQubicBuildPackage } from "./IQubicBuildPackage";
import { QubicPackageBuilder } from "../QubicPackageBuilder";


/**
 * typedef struct
* {
*     unsigned short tickDuration;
*     unsigned short epoch;
*     unsigned int tick;
*     unsigned short numberOfAlignedVotes;
*     unsigned short numberOfMisalignedVotes;
* } CurrentTickInfo;
 */
export class QubicTickInfo implements IQubicBuildPackage {

    private _internalPackageSize = 12;

    private tickDuration: number = 0;
    private epoch: number = 0;
    private tick: number = 0;
    private numberOfAlignedVotes: number = 0;
    private numberOfMisalignedVotes: number = 0;

    public getTickDuration(): number {
        return this.tickDuration;
    }

    public setTickDuration(tickDuration: number): void {
        this.tickDuration = tickDuration;
    }

    public getEpoch(): number {
        return this.epoch;
    }

    public setEpoch(epoch: number): void {
        this.epoch = epoch;
    }

    public getTick(): number {
        return this.tick;
    }

    public setTick(tick: number): void {
        this.tick = tick;
    }

    public getNumberOfAlignedVotes(): number {
        return this.numberOfAlignedVotes;
    }

    public setNumberOfAlignedVotes(numberOfAlignedVotes: number): void {
        this.numberOfAlignedVotes = numberOfAlignedVotes;
    }

    public getNumberOfMisalignedVotes(): number {
        return this.numberOfMisalignedVotes;
    }

    public setNumberOfMisalignedVotes(numberOfMisalignedVotes: number): void {
        this.numberOfMisalignedVotes = numberOfMisalignedVotes;
    }


    constructor(){
    }


    getPackageSize(): number {
        return this.getPackageData().length;
    }

    parse(data: Uint8Array): QubicTickInfo | undefined {
        if(data.length !== this._internalPackageSize)
        {
            console.error("INVALID PACKAGE SIZE")
            return undefined;
        }
        const dataView = new DataView(data.buffer);
        let offset = 0;
        this.setTickDuration(dataView.getInt16(0, true));
        offset += 2;
        this.setEpoch(dataView.getInt16(offset, true));
        offset += 2;
        this.setTick(dataView.getInt32(offset, true));
        offset += 4;
        this.setNumberOfAlignedVotes(dataView.getInt16(offset, true));
        offset += 2;
        this.setNumberOfMisalignedVotes(dataView.getInt16(offset, true));
        return this;
    }

    getPackageData(): Uint8Array {
        const builder = new QubicPackageBuilder(this._internalPackageSize);
        builder.addShort(this.tickDuration);
        builder.addShort(this.epoch);
        builder.addInt(this.tick);
        builder.addShort(this.numberOfAlignedVotes);
        builder.addShort(this.numberOfMisalignedVotes);
        return builder.getData();
    }
}