export class KeyHelper
{

    private SEED_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
    private PRIVATE_KEY_LENGTH = 32;
    private PUBLIC_KEY_LENGTH = 32;
    private CHECKSUM_LENGTH = 3;


    public createPublicKey(privateKey: Uint8Array, schnorrq: any, K12: any): Uint8Array {
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

    private seedToBytes(seed: string): Uint8Array {
        const bytes = new Uint8Array(seed.length);
        for (let i = 0; i < seed.length; i++) {
            bytes[i] = this.SEED_ALPHABET.indexOf(seed[i]);
        }
        return bytes;
    };

    public privateKey(seed: string, index: number, K12: any) {
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

    public static getIdentityBytes = function (identity: string): Uint8Array {
        const publicKeyBytes = new Uint8Array(32);
        const view = new DataView(publicKeyBytes.buffer, 0);
      
        for (let i = 0; i < 4; i++) {
          view.setBigUint64(i * 8, 0n, true);
          for (let j = 14; j-- > 0; ) {
            view.setBigUint64(i * 8, view.getBigUint64(i * 8, true) * 26n + BigInt(identity.charCodeAt(i * 14 + j)) - BigInt('A'.charCodeAt(0)), true);
          }
        }
      
        return publicKeyBytes;
      };
      
}