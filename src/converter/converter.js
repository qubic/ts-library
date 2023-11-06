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

'use strict'

const SHIFTED_HEX_CHARS = 'abcdefghijklmnop';
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export const bytesToShiftedHex = function (bytes) {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += SHIFTED_HEX_CHARS[bytes[i] >> 4] + SHIFTED_HEX_CHARS[bytes[i] & 15];
  }

  return hex.toUpperCase();
};

export const publicKeyStringToBytes = function (s) {
  const publicKeyBytes = new Uint8Array(32);
  const view = new DataView(publicKeyBytes.buffer, 0);

  for (let i = 0; i < 4; i++) {
    view.setBigUint64(i * 8, 0n, true);
    for (let j = 14; j-- > 0; ) {
      view.setBigUint64(i * 8, view.getBigUint64(i * 8, true) * 26n + BigInt(s.charCodeAt(i * 14 + j)) - BigInt('A'.charCodeAt(0)), true);
    }
  }

  return publicKeyBytes;
};

export const bytes32ToString = function (bytes) {
  const hex = bytesToShiftedHex(bytes);
  const buffer = new Uint8Array(32);
  const view = new DataView(buffer.buffer, 0);
  let s = '';

  for (let i = 0; i < bytes.length; i++) {
    view.setUint8(
      i,
      ((hex.charCodeAt(i << 1) - 'A'.charCodeAt(0)) << 4) |
        (hex.charCodeAt((i << 1) + 1) - 'A'.charCodeAt(0)),
      true
    );
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 14; j++) {
      s += String.fromCharCode(
        Number((view.getBigUint64(i * 8, true) % 26n) + BigInt('A'.charCodeAt(0)))
      );
      view.setBigUint64(i * 8, view.getBigUint64(i * 8, true) / 26n, true);
    }
  }

  return s.toLowerCase();
};

export const digestBytesToString = bytes32ToString;

export const publicKeyBytesToString = function (bytes) {
  if (bytes.length === 32) {
    return bytes32ToString(bytes).toUpperCase();
  }

  const hex = bytesToShiftedHex(bytes);
  const buffer = new Uint8Array(40);
  const view = new DataView(buffer.buffer, 0);
  let s = '';

  for (let i = 0; i < bytes.length; i++) {
    view.setUint8(
      i,
      ((hex.charCodeAt(i << 1) - 'A'.charCodeAt(0)) << 4) |
        (hex.charCodeAt((i << 1) + 1) - 'A'.charCodeAt(0)),
      true
    );
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 14; j++) {
      s += String.fromCharCode(
        Number((view.getBigUint64(i * 8, true) % 26n) + BigInt('A'.charCodeAt(0)))
      );
      view.setBigUint64(i * 8, view.getBigUint64(i * 8, true) / 26n, true);
    }
  }

  view.setBigUint64(32, view.getBigUint64(32, true) & 0x3ffffn, true);

  for (let i = 0; i < 4; i++) {
    s += String.fromCharCode(
      Number((view.getBigUint64(32, true) % 26n) + BigInt('A'.charCodeAt(0)))
    );
    view.setBigUint64(32, view.getBigUint64(32, true) / 26n, true);
  }

  return s.toUpperCase();
};

export const seedStringToBytes = function (seed) {
  const bytes = new Uint8Array(seed.length);
  for (let i = 0; i < seed.length; i++) {
    bytes[i] = ALPHABET.indexOf(seed[i]);
  }
  return bytes;
};