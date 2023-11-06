'use strict';

import Module from './libFourQ_K12.js';
import { keccakP160012 } from './keccakp.js'


const allocU8 = function (l, v) {
  let ptr = Module._malloc(l);
  let chunk = Module.HEAPU8.subarray(ptr, ptr + l);
  if (v) {
    chunk.set(v);
  }
  return chunk;
};

const allocU16 = function (l, v) {
  let ptr = Module._malloc(l);
  let chunk = Module.HEAPU16.subarray(ptr, ptr + l);
  chunk.set(v);
  return chunk;
};

/**
 * @namespace Crypto
 */

/**
 * A promise which always resolves to object with crypto functions.
 *
 * @constant {Promise<Crypto>}
 * @memberof module:qubic
 */
const crypto = new Promise(function (resolve) {
  Module.onRuntimeInitialized = function () {
    /**
     * @memberof Crypto.schnorrq
     * @param {Uint8Array} secretKey
     * @returns {Uint8Array}
     */
    const generatePublicKey = function (secretKey) {
      const sk = allocU8(secretKey.length, secretKey);
      const pk = allocU8(32);

      const free = function () {
        Module._free(sk.byteOffset);
        Module._free(pk.byteOffset);
      };

      Module._SchnorrQ_KeyGeneration(sk.byteOffset, pk.byteOffset);
      const key = pk.slice();
      free();
      return key;
    };

    /**
     * @memberof Crypto.schnorrq
     * @param {Uint8Array} secretKey
     * @param {Uint8Array} publicKey
     * @param {Uint8Array} message
     * @returns {Uint8Array}
     */
    const sign = function (secretKey, publicKey, message) {
      const sk = allocU8(secretKey.length, secretKey);
      const pk = allocU8(publicKey.length, publicKey);
      const m = allocU8(message.length, message);
      const s = allocU8(64);

      const free = function () {
        Module._free(sk.byteOffset);
        Module._free(pk.byteOffset);
        Module._free(m.byteOffset);
        Module._free(s.byteOffset);
      };

      Module._SchnorrQ_Sign(
        sk.byteOffset,
        pk.byteOffset,
        m.byteOffset,
        message.length,
        s.byteOffset
      );
      const sig = s.slice();
      free();
      return sig;
    };

    /**
     * @memberof Crypto.schnorrq
     * @param {Uint8Array} publicKey
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {number} 1 if valid, 0 if invalid
     */
    const verify = function (publicKey, message, signature) {
      const pk = allocU8(publicKey.length, publicKey);
      const m = allocU8(message.length, message);
      const s = allocU8(signature.length, signature);
      const v = allocU16(1, new Uint16Array(1));

      const free = function () {
        Module._free(pk.byteOffset);
        Module._free(m.byteOffset);
        Module._free(s.byteOffset);
        Module._free(v.byteOffset);
      };

      Module._SchnorrQ_Verify(
        pk.byteOffset,
        m.byteOffset,
        message.length,
        s.byteOffset,
        v.byteOffset
      );
      const ver = v[0];
      free();
      return ver;
    };

    /**
     * @memberof Crypto.kex
     * @param {Uint8Array} secretKey
     * @returns {Uint8Array} Public key
     */
    const generateCompressedPublicKey = function (secretKey) {
      const sk = allocU8(secretKey.length, secretKey);
      const pk = allocU8(32);

      const free = function () {
        Module._free(sk.byteOffset);
        Module._free(pk.byteOffset);
      };

      Module._CompressedPublicKeyGeneration(sk.byteOffset, pk.byteOffset);
      const key = pk.slice();
      free();
      return key;
    };

    /**
     * @memberof Crypto.kex
     * @param {Uint8Array} secretKey
     * @param {Uint8Array} publicKey
     * @returns {Uint8Array} Shared key
     */
    const compressedSecretAgreement = function (secretKey, publicKey) {
      const sk = allocU8(secretKey.length, secretKey);
      const pk = allocU8(publicKey.length, publicKey);
      const shk = allocU8(32);

      const free = function () {
        Module._free(sk.byteOffset);
        Module._free(pk.byteOffset);
        Module._free(shk.byteOffset);
      };

      Module._CompressedSecretAgreement(sk.byteOffset, pk.byteOffset, shk.byteOffset);
      const key = shk.slice();
      free();
      return key;
    };

    /**
     * @memberof Crypto
     * @param {Uint8Array} input
     * @param {Uint8Array} output
     * @param {number} outputLength
     * @param {number} outputOffset
     */
    const K12 = function (input, output, outputLength, outputOffset = 0) {
      const i = allocU8(input.length, input);
      const o = allocU8(outputLength, new Uint8Array(outputLength));

      const free = function () {
        Module._free(i.byteOffset);
        Module._free(o.byteOffset);
      };

      Module._KangarooTwelve(i.byteOffset, input.length, o.byteOffset, outputLength, 0, 0);
      output.set(o.slice(), outputOffset);
      free();
    };

    resolve({
      /**
       * @namespace Crypto.schnorrq
       */
      schnorrq: {
        generatePublicKey,
        sign,
        verify,
      },
      /**
       * @namespace Crypto.kex
       */
      kex: {
        generateCompressedPublicKey,
        compressedSecretAgreement,
      },
      K12,
      keccakP160012,
      KECCAK_STATE_LENGTH: 200,
    });
  };
});

crypto.keccakP160012 = keccakP160012;
export const KECCAK_STATE_LENGTH = 200;
export const SIGNATURE_LENGTH = 64;
export const PRIVATE_KEY_LENGTH = 32;
export const PUBLIC_KEY_LENGTH = 32;
export const DIGEST_LENGTH = 32;
export const NONCE_LENGTH = 32;
export const CHECKSUM_LENGTH = 3;

export default crypto;
