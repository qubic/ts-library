import { IQubicBuildPackage } from "./qubic-types/IQubicBuildPackage";
import { QubicDefinitions } from "./QubicDefinitions";
import crypto from './crypto'
import { KeyHelper } from "./keyHelper";

export class QubicPackageBuilder {

    private packet: Uint8Array;
    private offset: number = 0;

    constructor(size: number){
        // todo: create a dynamic builder
        this.packet = new Uint8Array(size);
    }


    getData(): Uint8Array {
        return this.packet;
    }

    sign(seed: string): Promise<Uint8Array>  {
        return crypto.then(({ schnorrq, K12 }) => {
            const keyHelper = new KeyHelper();

            const privateKey = keyHelper.privateKey(seed, 0, K12);
            const publicKey = keyHelper.createPublicKey(privateKey, schnorrq, K12);

            const digest = new Uint8Array(QubicDefinitions.DIGEST_LENGTH);
            const toSign = this.packet.slice(0, this.offset);

            K12(toSign, digest, QubicDefinitions.DIGEST_LENGTH);
            const signatur = schnorrq.sign(privateKey, publicKey, digest);

            this.packet.set(signatur, this.offset);
            this.offset += QubicDefinitions.SIGNATURE_LENGTH;

            return this.packet.slice(0, this.offset);
        });
    }

    signAndDigest(seed: string): Promise<{signedData: Uint8Array, digest: Uint8Array, signature: Uint8Array}>  {
        return crypto.then(({ schnorrq, K12 }) => {
            const keyHelper = new KeyHelper();

            const privateKey = keyHelper.privateKey(seed, 0, K12);
            const publicKey = keyHelper.createPublicKey(privateKey, schnorrq, K12);

            const digest = new Uint8Array(QubicDefinitions.DIGEST_LENGTH);
            const toSign = this.packet.slice(0, this.offset);

            K12(toSign, digest, QubicDefinitions.DIGEST_LENGTH);
            const signature = schnorrq.sign(privateKey, publicKey, digest);

            this.packet.set(signature, this.offset);
            this.offset += QubicDefinitions.SIGNATURE_LENGTH;

            const signedData = this.packet.slice(0, this.offset);
            K12(signedData, digest, QubicDefinitions.DIGEST_LENGTH)

            return {
                signedData: signedData,
                digest: digest,
                signature: signature
            };
        });
    }

    add(q: IQubicBuildPackage): QubicPackageBuilder{
        const data = q.getPackageData();
        this.packet.set(data, this.offset);
        this.offset += data.length;
        return this;
    }

    addRaw(q: Uint8Array): QubicPackageBuilder{
        this.packet.set(q, this.offset);
        this.offset += q.length;
        return this;
    }

    addShort(q: number /* must be a short */): QubicPackageBuilder{
        this.packet.set(this.FromShort(q), this.offset);
        this.offset += 2;
        return this;
    }

    addInt(q: number /* must be a short */): QubicPackageBuilder{
        this.packet.set(this.FromInt(q), this.offset);
        this.offset += 4;
        return this;
    }

    private FromInt(num: number): Uint8Array{
        // If num is a 32-bit integer
        let buffer = new ArrayBuffer(4); // 4 bytes for a 32-bit integer
        let dataview = new DataView(buffer);
        dataview.setInt32(0, num, true); // Use setUint32 if you are dealing with unsigned integers
        return new Uint8Array(buffer);
    }
    private FromShort(num: number): Uint8Array{
        // If num is a 32-bit integer
        let buffer = new ArrayBuffer(2); // 4 bytes for a 32-bit integer
        let dataview = new DataView(buffer);
        dataview.setInt16(0, num, true); // Use setUint32 if you are dealing with unsigned integers
        return new Uint8Array(buffer);
    }
}