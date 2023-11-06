import { IQubicBuildPackage } from "./IQubicBuildPackage";
import { Long } from "./Long";
import { QubicPackageBuilder } from "../QubicPackageBuilder";
import { PublicKey } from "./PublicKey";
import { QubicDefinitions } from "../QubicDefinitions";
import { Signature } from "./Signature";


/**
 * typedef struct
{
    unsigned short computorIndex;
    unsigned short epoch;
    unsigned int tick;

    unsigned short millisecond;
    unsigned char second;
    unsigned char minute;
    unsigned char hour;
    unsigned char day;
    unsigned char month;
    unsigned char year;

    union
    {
        struct
        {
            unsigned char uriSize;
            unsigned char uri[255];
        } proposal;
        struct
        {
            unsigned char zero;
            unsigned char votes[(NUMBER_OF_COMPUTORS * 3 + 7) / 8];
            unsigned char quasiRandomNumber;
        } ballot;
    } varStruct;

    unsigned char timelock[32];
    unsigned char transactionDigests[NUMBER_OF_TRANSACTIONS_PER_TICK][32];
    long long contractFees[MAX_NUMBER_OF_CONTRACTS];

    unsigned char signature[SIGNATURE_SIZE];
} TickData;
 */
export class QubicTickData implements IQubicBuildPackage {

    private _internalPackageSize = 41328;

    private _unionDataView: DataView;
    public get unionDataView(): DataView {
        if(!this._unionDataView)
            this._unionDataView = new DataView(this.unionData.buffer);
        return this._unionDataView;
    }
    public set unionDataView(value: DataView) {
        this._unionDataView = value;
    }

    private computorIndex: number;
    private epoch: number;
    private tick: number;

    private millisecond: number;
    private second:number;
    private minute:number;

    private hour:number;
    private day:number;
    private month:number;
    private year:number;


    private unionData: Uint8Array;

    private timeLock: Uint8Array;
    private transactionDigests: Uint8Array;

    private contractFees: bigint[];

    private signature: Signature;

    

    public getSignature(): Signature {
        return this.signature;
    }

    public setSignature(signature: Signature): void {
        this.signature = signature;
    }

    public getComputorIndex(): number {
        return this.computorIndex;
    }

    public setComputorIndex(computorIndex: number): void {
        this.computorIndex = computorIndex;
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

    public getMillisecond(): number {
        return this.millisecond;
    }

    public setMillisecond(millisecond: number): void {
        this.millisecond = millisecond;
    }

    public getSecond(): number {
        return this.second;
    }

    public setSecond(second: number): void {
        this.second = second;
    }

    public getMinute(): number {
        return this.minute;
    }

    public setMinute(minute: number): void {
        this.minute = minute;
    }

    public getHour(): number {
        return this.hour;
    }

    public setHour(hour: number): void {
        this.hour = hour;
    }

    public getDay(): number {
        return this.day;
    }

    public setDay(day: number): void {
        this.day = day;
    }

    public getMonth(): number {
        return this.month;
    }

    public setMonth(month: number): void {
        this.month = month;
    }

    public getYear(): number {
        return this.year;
    }

    public setYear(year: number): void {
        this.year = year;
    }

    public getUnionData(): Uint8Array {
        return this.unionData;
    }

    public setUnionData(unionData: Uint8Array): void {
        this.unionData = unionData;
    }

    public getTimeLock(): Uint8Array {
        return this.timeLock;
    }

    public setTimeLock(timeLock: Uint8Array): void {
        this.timeLock = timeLock;
    }

    // todo: implement

    // public getTransactionDigests(): Uint8Array[][] {
    //     return this.transactionDigests;
    // }

    public setTransactionDigests(transactionDigests: Uint8Array /* jagged array 1024x32 */): void {
        this.transactionDigests = transactionDigests;
    }

    public getContractFees(): bigint[] {
        return this.contractFees;
    }

    public setContractFees(contractFees: bigint[]): void {
        this.contractFees = contractFees;
    }

    /* union data types */
    public getProposalUriSize(): number {
        return this.unionData[0];
    }
    public setProposalUriSize(size: number): void{
        this.unionData[0] = size;
    }
    public getProposalUri(): string {
        return new TextDecoder().decode(this.unionData.slice(1, this.getProposalUriSize()));
    }
    public setProposalUri(uri: string): void{
        if(uri.length > 255){
            console.error("URI SIZE MUST BE MAX 255");
            throw "URI SIZE MUST BE MAX 255";
        }
        var bytes = new TextEncoder().encode(uri);
        this.unionData.set(bytes, 1);
        this.setProposalUriSize(uri.length);
    }


    constructor(){
    }

  
    getPackageSize(): number {
        return this._internalPackageSize;
    }

    parse(data: Uint8Array): QubicTickData | undefined {
        if(data.length !== this._internalPackageSize)
        {
            console.error("INVALID PACKAGE SIZE")
            return undefined;
        }
        const dataView = new DataView(data.buffer);
        let offset = 0;

        this.setComputorIndex(dataView.getUint16(offset, true));
        offset += 2;

        this.setEpoch(dataView.getUint16(offset, true));
        offset += 2;

        this.setTick(dataView.getUint32(offset, true));
        offset += 4;
       

        this.setMillisecond(dataView.getUint16(offset, true));
        offset += 2;

        this.setSecond(data[offset++]);
        this.setMinute(data[offset++]);
        this.setHour(data[offset++]);
        this.setDay(data[offset++]);
        this.setMonth(data[offset++]);
        this.setYear(data[offset++]);

        this.setUnionData(data.slice(offset, 256));
        offset += 256;

        this.setTimeLock(data.slice(offset, 32));
        offset += 32;


        this.setTransactionDigests(data.slice(offset, QubicDefinitions.NUMBER_OF_TRANSACTIONS_PER_TICK * QubicDefinitions.DIGEST_LENGTH));
        offset += QubicDefinitions.NUMBER_OF_TRANSACTIONS_PER_TICK * QubicDefinitions.DIGEST_LENGTH;

        const contractFees = [];
        for(let i = 0; i < QubicDefinitions.MAX_NUMBER_OF_CONTRACTS;i++){
            contractFees.push(dataView.getBigInt64(offset, true));
            offset += 8;
        }
        this.setContractFees(contractFees);

        this.setSignature(new Signature(data.slice(offset, QubicDefinitions.SIGNATURE_LENGTH)));
        offset += QubicDefinitions.SIGNATURE_LENGTH;
        
        return this;
    }

    getPackageData(): Uint8Array {
        // todo: implement

        return new Uint8Array();
    }
}