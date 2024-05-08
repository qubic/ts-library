/*

Permission is hereby granted, perpetual, worldwide, non-exclusive, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:


  1. The Software cannot be used in any form or in any substantial portions for development, maintenance and for any other purposes, in the military sphere and in relation to military products, 
  including, but not limited to:

    a. any kind of armored force vehicles, missile weapons, warships, artillery weapons, air military vehicles (including military aircrafts, combat helicopters, military drones aircrafts), 
    air defense systems, rifle armaments, small arms, firearms and side arms, melee weapons, chemical weapons, weapons of mass destruction;

    b. any special software for development technical documentation for military purposes;

    c. any special equipment for tests of prototypes of any subjects with military purpose of use;

    d. any means of protection for conduction of acts of a military nature;

    e. any software or hardware for determining strategies, reconnaissance, troop positioning, conducting military actions, conducting special operations;

    f. any dual-use products with possibility to use the product in military purposes;

    g. any other products, software or services connected to military activities;

    h. any auxiliary means related to abovementioned spheres and products.


  2. The Software cannot be used as described herein in any connection to the military activities. A person, a company, or any other entity, which wants to use the Software, 
  shall take all reasonable actions to make sure that the purpose of use of the Software cannot be possibly connected to military purposes.


  3. The Software cannot be used by a person, a company, or any other entity, activities of which are connected to military sphere in any means. If a person, a company, or any other entity, 
  during the period of time for the usage of Software, would engage in activities, connected to military purposes, such person, company, or any other entity shall immediately stop the usage 
  of Software and any its modifications or alterations.


  4. Abovementioned restrictions should apply to all modification, alteration, merge, and to other actions, related to the Software, regardless of how the Software was changed due to the 
  abovementioned actions.


The above copyright notice and this permission notice shall be included in all copies or substantial portions, modifications and alterations of the Software.


THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH 
THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

import crypto from './crypto'
import { seedStringToBytes, digestBytesToString, publicKeyStringToBytes, publicKeyBytesToString } from './converter/converter.js';
import BigNumber from 'bignumber.js';
import { QubicDefinitions } from './QubicDefinitions';


// todo: refactor

/**
 * this class contains a lot of legacy code and should be refactored
 */
export class QubicHelper {


    private SEED_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
    private SHIFTED_HEX_CHARS = 'abcdefghijklmnop';
    private PRIVATE_KEY_LENGTH = 32;
    private PUBLIC_KEY_LENGTH = 32;
    private SEED_IN_LOWERCASE_LATIN_LENGTH = 55;
    private CHECKSUM_LENGTH = 3;

    /**
     * 
     * Creates a complete ID Package based on the provided seed
     * 
     * @param seed 
     * @returns 
     */
    public async createIdPackage(seed: string): Promise<{ publicKey: Uint8Array, privateKey: Uint8Array, publicId: string }> {

        const { schnorrq, K12 } = await crypto;

        const privateKey = this.privateKey(seed, 0, K12);
        const publicKey = schnorrq.generatePublicKey(privateKey);
        const publicId = await this.getIdentity(publicKey);

        return {publicKey, privateKey, publicId };
    }

    /**
     * creates the checksum for a given key
     * 
     * @param publicKey 
     * @returns 
     */
    private async getCheckSum(publicKey: Uint8Array): Promise<Uint8Array> {
        const { K12 } = await crypto;
        const digest = new Uint8Array(QubicDefinitions.DIGEST_LENGTH);
        K12(publicKey, digest, QubicDefinitions.DIGEST_LENGTH);
        const checksum = digest.slice(0, this.CHECKSUM_LENGTH);
        return checksum;
    }

    /**
     * 
     * Creates the human readable public key from the publickey
     * 
     * @param publicKey 
     * @param lowerCase 
     * @returns 
     */
    public async getIdentity(publicKey: Uint8Array, lowerCase: boolean = false): Promise<string> {
        let newId = '';
        for (let i = 0; i < 4; i++) {
            let longNUmber = new BigNumber(0);
            longNUmber.decimalPlaces(0);
            publicKey.slice(i * 8, (i + 1) * 8).forEach((val, index) => {
                longNUmber = longNUmber.plus(new BigNumber((val * 256 ** index).toString(2), 2));
            });
            for (let j = 0; j < 14; j++) {
                newId += String.fromCharCode(longNUmber.mod(26).plus((lowerCase ? 'a' : 'A').charCodeAt(0)).toNumber());
                longNUmber = longNUmber.div(26);
            }
        }
        
        // calculate checksum
        const checksum = await this.getCheckSum(publicKey);

        // convert to int
        let identityBytesChecksum = (checksum[2] << 16) | (checksum[1] << 8) | checksum[0];
        identityBytesChecksum = identityBytesChecksum & 0x3FFFF;
        
        for (let i = 0; i < 4; i++) {
            newId += String.fromCharCode(identityBytesChecksum % 26 + (lowerCase ? 'a' : 'A').charCodeAt(0));
            identityBytesChecksum = identityBytesChecksum / 26;
        }
        return newId;
    }

    async getHumanReadableBytes(publicKey: Uint8Array): Promise<string> {
        return await this.getIdentity(publicKey, true);
    }

    seedToBytes(seed: string): Uint8Array {
        const bytes = new Uint8Array(seed.length);
        for (let i = 0; i < seed.length; i++) {
            bytes[i] = this.SEED_ALPHABET.indexOf(seed[i]);
        }
        return bytes;
    };

    privateKey(seed: string, index: number, K12: any) {
        const byteSeed = this.seedToBytes(seed);
        const preimage = byteSeed.slice();

        while (index-- > 0) {
            for (let i = 0; i < preimage.length; i++) {
                if (++preimage[i] > this.SEED_ALPHABET.length) {
                    preimage[i] = 1;
                } else {
                    break;
                }
            }
        }

        const key = new Uint8Array(this.PRIVATE_KEY_LENGTH);
        K12(preimage, key, this.PRIVATE_KEY_LENGTH);
        return key;
    };

    public getIdentityBytes = function (identity: string): Uint8Array {
        const publicKeyBytes = new Uint8Array(32);
        const view = new DataView(publicKeyBytes.buffer, 0);

        for (let i = 0; i < 4; i++) {
            view.setBigUint64(i * 8, 0n, true);
            for (let j = 14; j-- > 0;) {
                view.setBigUint64(i * 8, view.getBigUint64(i * 8, true) * 26n + BigInt(identity.charCodeAt(i * 14 + j)) - BigInt('A'.charCodeAt(0)), true);
            }
        }

        return publicKeyBytes;
    };

    /**
     * Verifies if a given identity is valid
     * @param identity 
     */
    public async verifyIdentity(identity: string): Promise<boolean> {

        if(!identity || identity.length != 60 || !/^[A-Z]+$/.test(identity)) // must be 60 upper case characters
            return false;

        const publicKey = this.getIdentityBytes(identity);
        const idFromBytes = await this.getIdentity(publicKey);

        // todo: it would be enough to just check checksum bytes instead of compare complete id

        return identity === idFromBytes;
    }

    private createPublicKey(privateKey: Uint8Array, schnorrq: any, K12: any): Uint8Array {
        const publicKeyWithChecksum = new Uint8Array(this.PUBLIC_KEY_LENGTH + this.CHECKSUM_LENGTH);
        publicKeyWithChecksum.set(schnorrq.generatePublicKey(privateKey));
        K12(
            publicKeyWithChecksum.subarray(0, this.PUBLIC_KEY_LENGTH),
            publicKeyWithChecksum,
            this.CHECKSUM_LENGTH,
            this.PUBLIC_KEY_LENGTH
        );
        return publicKeyWithChecksum;
    }

    private REQUEST_RESPONSE_HEADER_SIZE = 8;
    private TRANSACTION_SIZE = 144;
    private IPO_TRANSACTION_SIZE = 144 + 8 /*price*/ + 2 /* quantity */ + 6 /* padding */;
    private SET_PROPOSAL_AND_BALLOT_REQUEST_SIZE = 592;
    private TRANSACTION_INPUT_SIZE_OFFSET = 0;
    private TRANSACTION_INPUT_SIZE_LENGTH = 0;
    private SIGNATURE_LENGTH = 64;
    private DIGEST_LENGTH = 32;
    private SPECIAL_COMMAND_SHUT_DOWN = 0;
    private SPECIAL_COMMAND_GET_PROPOSAL_AND_BALLOT_REQUEST = 1;
    private SPECIAL_COMMAND_GET_PROPOSAL_AND_BALLOT_RESPONSE = 2;
    private SPECIAL_COMMAND_SET_PROPOSAL_AND_BALLOT_REQUEST = 3;
    private SPECIAL_COMMAND_SET_PROPOSAL_AND_BALLOT_RESPONSE = 4;
    private PROCESS_SPECIAL_COMMAND = 255;


    public async createIpo(sourceSeed: string, contractIndex: number, price: number, quantity: number, tick: number): Promise<Uint8Array> {

        return crypto.then(({ schnorrq, K12 }) => {
            // sender
            const sourcePrivateKey = this.privateKey(sourceSeed, 0, K12);
            const sourcePublicKey = this.createPublicKey(sourcePrivateKey, schnorrq, K12);

            const tx = new Uint8Array(this.IPO_TRANSACTION_SIZE).fill(0);
            const txView = new DataView(tx.buffer);

            // fill all with zero
            for (let i = 0; i < this.IPO_TRANSACTION_SIZE; i++) {
                tx[i] = 0;
            }

            // sourcePublicKey byte[] // 32
            let offset = 0;
            let i = 0;
            for (i = 0; i < this.PUBLIC_KEY_LENGTH; i++) {
                tx[i] = sourcePublicKey[i];
            }
            offset = i;

            tx[offset] = contractIndex;
            offset++;

            for (i = 1; i < this.PUBLIC_KEY_LENGTH; i++) {
                tx[offset + i] = 0;
            }
            offset += i-1;

            txView.setBigInt64(offset, BigInt(0), true); // for ipo tx amoun is just 0
            offset += 8;

            txView.setUint32(offset, tick, true);
            offset += 4;

            txView.setUint16(offset, 1, true); // inputType for IPO is 1
            offset += 2;

            txView.setUint16(offset, 16, true); // inputSize for IPO is 16
            offset += 2;

            // add ipo specifix stuff
            // price
            txView.setBigInt64(offset, BigInt(price), true);
            offset += 8;

            // quantity
            txView.setInt16(offset, quantity, true);
            offset += 2;

            // padding
            offset += 6;

            const digest = new Uint8Array(this.DIGEST_LENGTH);
            const toSign = tx.slice(0, offset);

            K12(toSign, digest, this.DIGEST_LENGTH);
            const signedtx = schnorrq.sign(sourcePrivateKey, sourcePublicKey, digest);

            tx.set(signedtx, offset);
            offset += this.SIGNATURE_LENGTH;

            return tx;
        });
    }

    public async createTransaction(sourceSeed: string, destPublicId: string, amount: number, tick: number): Promise<Uint8Array> {

        return crypto.then(({ schnorrq, K12 }) => {
            // sender
            const sourcePrivateKey = this.privateKey(sourceSeed, 0, K12);
            const sourcePublicKey = this.createPublicKey(sourcePrivateKey, schnorrq, K12);
            const destPublicKey = publicKeyStringToBytes(destPublicId).slice(0, this.PUBLIC_KEY_LENGTH);

            const tx = new Uint8Array(this.TRANSACTION_SIZE).fill(0);
            const txView = new DataView(tx.buffer);

            // sourcePublicKey byte[] // 32
            let offset = 0;
            let i = 0;
            for (i = 0; i < this.PUBLIC_KEY_LENGTH; i++) {
                tx[i] = sourcePublicKey[i];
            }
            offset = i;

            for (i = 0; i < this.PUBLIC_KEY_LENGTH; i++) {
                tx[offset + i] = destPublicKey[i];
            }
            offset += i;

            txView.setBigInt64(offset, BigInt(amount), true);
            offset += 8;

            txView.setUint32(offset, tick, true);
            offset += 4;

            txView.setUint16(offset, 0, true);
            offset += 2;

            txView.setUint16(offset, 0, true);
            offset += 2;

            const digest = new Uint8Array(this.DIGEST_LENGTH);
            const toSign = tx.slice(0, offset);

            K12(toSign, digest, this.DIGEST_LENGTH);
            const signedtx = schnorrq.sign(sourcePrivateKey, sourcePublicKey, digest);

            tx.set(signedtx, offset);
            offset += this.SIGNATURE_LENGTH;

            return tx;
        });
    }

    // todo: remove on next update
    // private getIncreasingNonceAndCommandType(type: number): Uint8Array {
    //     let timestamp = Math.floor(Date.now() / 1000);
    //     const byteArray = new Uint8Array(8);

    //     const txView = new DataView(byteArray.buffer);
    //     txView.setUint32(0, timestamp, true);
    //     byteArray[7] = type;
    //     return byteArray;
    // }

    /**
     * 
     * implementation aligned with qubic-cli
     * 
     * @param type 
     * @returns 
     */
    private getIncreasingNonceAndCommandType(type: number): Uint8Array {
        const timestamp: bigint = BigInt(Math.floor(Date.now() / 1000));
        const commandByte: bigint = BigInt(type) << BigInt(56);
        const result = commandByte | timestamp;

        const byteArray = new Uint8Array(8);
        const txView = new DataView(byteArray.buffer);
        txView.setBigUint64(0, result, true);
        return byteArray;
    }

    public async createProposal(protocol: number, computorIndex: number, operatorSeed: string, url: string): Promise<Uint8Array> {

        return crypto.then(({ schnorrq, K12 }) => {

            // operator
            const operatorPrivateKey = this.privateKey(operatorSeed, 0, K12);
            const operatorPublicKey = this.createPublicKey(operatorPrivateKey, schnorrq, K12);

            // prepare url
            const encoder = new TextEncoder();
            const urlBytes = encoder.encode(url);
            const uri = new Uint8Array(255);
            const uriSize = urlBytes.length;
            uri.set(urlBytes);

            const proposal = new Uint8Array(this.SET_PROPOSAL_AND_BALLOT_REQUEST_SIZE + this.REQUEST_RESPONSE_HEADER_SIZE).fill(0);
            const txView = new DataView(proposal.buffer);
            let offset = 0;

            // header
            // byte[3] size
            const size = 600;
            proposal[0] = size;
            proposal[1] = (size >> 8);
            proposal[2] = (size >> 16);
            offset += 3;

            // byte type
            proposal[offset] = this.PROCESS_SPECIAL_COMMAND;
            offset++;

            // byte[3] dejavu (we let it empty)
            proposal[offset++] = Math.floor(Math.random() * 255);
            proposal[offset++] = Math.floor(Math.random() * 255);
            proposal[offset++] = Math.floor(Math.random() * 255);

            // byte type deprecated
            proposal[offset] = this.PROCESS_SPECIAL_COMMAND;
            offset++;

            // ulong everIncreasingNonceAndCommandType // 8
            var timeStamp = this.getIncreasingNonceAndCommandType(this.SPECIAL_COMMAND_SET_PROPOSAL_AND_BALLOT_REQUEST);
            for (let i = 0; i < timeStamp.length; i++) {
                proposal[offset + i] = timeStamp[i];
            }
            offset += timeStamp.length;

            // ushort computorIndex // 2
            txView.setUint16(offset, computorIndex, true);
            offset += 2;

            // padding //6
            const padding = 6;
            for (let i = 0; i < padding; i++) {
                proposal[offset + i] = 0;
            }
            offset += padding;

            // Start ComputorProposal
            // byte uriSize // 1
            proposal[offset] = uriSize;
            offset++;

            // byte[255] uri // 255
            for (let i = 0; i < uriSize; i++) {
                proposal[offset + i] = uri[i];
            }
            offset += 255;

            // Start ComputorBallot
            // not used for this request therefore we let it empty
            offset += 256;

            const digest = new Uint8Array(this.DIGEST_LENGTH);
            const toSign = proposal.slice(this.REQUEST_RESPONSE_HEADER_SIZE, offset);

            K12(toSign, digest, this.DIGEST_LENGTH);
            const signatur = schnorrq.sign(operatorPrivateKey, operatorPublicKey, digest);

            proposal.set(signatur, offset);
            offset += this.SIGNATURE_LENGTH;

            return proposal;
        });
    }


    private VotesToByteArray(votes: number[]) {
        var bitArray = [];

        for (var computorIndex = 0; computorIndex < votes.length; computorIndex++) {
            var vote = votes[computorIndex];

            for (var i = 0; i < 3; i++) {
                var bit = (vote >> i) & 1;
                bitArray.push(bit);
            }
        }

        var output = new Uint8Array(Math.ceil(bitArray.length / 8));

        for (var k = 0; k < bitArray.length; k += 8) {
            var byteIndex = Math.floor(k / 8);
            var byteValue = 0;
            for (var j = 0; j < 8; j++) {
                var bit:number = bitArray[k + j] || 0; // Use 0 for padding if bitArray is exhausted
                byteValue |= (bit << j);
            }
            output[byteIndex] = byteValue;
        }
        return output;
    }

    public async createBallotRequests(protocol: number, operatorSeed: string, computorIndices: number[], votes: number[]): Promise<Uint8Array[]> {

        return crypto.then(({ schnorrq, K12 }) => {

            const output: Uint8Array[] = [];

            // operator
            const operatorPrivateKey = this.privateKey(operatorSeed, 0, K12);
            const operatorPublicKey = this.createPublicKey(operatorPrivateKey, schnorrq, K12);

            for (let index = 0; index < computorIndices.length; index++) {

                const proposal = new Uint8Array(this.SET_PROPOSAL_AND_BALLOT_REQUEST_SIZE + this.REQUEST_RESPONSE_HEADER_SIZE).fill(0);
                const txView = new DataView(proposal.buffer);
                let offset = 0;

                // header
                // byte[3] size
                const size = 600;
                proposal[0] = size;
                proposal[1] = (size >> 8);
                proposal[2] = (size >> 16);
                offset += 3;

                // byte type
                proposal[offset] = this.PROCESS_SPECIAL_COMMAND;
                offset++;

                // byte[3] dejavu (we let it empty)
                proposal[offset++] = Math.floor(Math.random() * 255);
                proposal[offset++] = Math.floor(Math.random() * 255);
                proposal[offset++] = Math.floor(Math.random() * 255);

                // byte type (depcrecated)
                proposal[offset] = this.PROCESS_SPECIAL_COMMAND;
                offset++;

                // ulong everIncreasingNonceAndCommandType // 8
                var timeStamp = this.getIncreasingNonceAndCommandType(this.SPECIAL_COMMAND_SET_PROPOSAL_AND_BALLOT_REQUEST);
                for (let i = 0; i < timeStamp.length; i++) {
                    proposal[offset + i] = timeStamp[i];
                }
                offset += timeStamp.length;

                // ushort computorIndex // 2
                txView.setUint16(offset, computorIndices[index], true);
                offset += 2;

                // padding //6
                const padding = 6;
                for (let i = 0; i < padding; i++) {
                    proposal[offset + i] = 0;
                }
                offset += padding;

                // Start ComputorProposal
                // byte uriSize // 1
                proposal[offset] = 0;
                offset++;

                // byte[255] uri // 255 // => ignore for ballot request
                // not used for this request therefore we let it empty
                offset += 255;

                // Start ComputorBallot
                offset++; // zero

                // map votes
                var voteBytes = this.VotesToByteArray(votes);
                for (let i = 0; i < voteBytes.length; i++) {
                    proposal[offset++] = voteBytes[i]
                }
                offset++; // quasirandomnumber

                const digest = new Uint8Array(this.DIGEST_LENGTH);
                const toSign = proposal.slice(this.REQUEST_RESPONSE_HEADER_SIZE, offset);

                K12(toSign, digest, this.DIGEST_LENGTH);
                const signatur = schnorrq.sign(operatorPrivateKey, operatorPublicKey, digest);

                proposal.set(signatur, offset);
                offset += this.SIGNATURE_LENGTH;

                output.push(proposal);
            }
            return output;
        });
    }


    private downloadBlob(fileName: string, blob: Blob): void {
        if ((<any>window.navigator).msSaveOrOpenBlob) {
            (<any>window.navigator).msSaveBlob(blob, fileName);
        } else {
            const anchor = window.document.createElement('a');
            anchor.href = window.URL.createObjectURL(blob);
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(anchor.href);
        }
    }
}



