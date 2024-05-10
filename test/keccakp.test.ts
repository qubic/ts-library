import { keccakP160012 } from "../dist/crypto/keccakp";

describe("keccakP160012", () => {
  it("should correctly hash input", () => {
    const input1 = new Uint32Array([
      0x01234567, 0x89abcdef, 0xfedcba98, 0x76543210,
    ]);
    const expectedOutput1 = new Uint32Array([2090479703, 3842222542, 0, 0]);
    keccakP160012(input1);
    expect(input1).toEqual(expectedOutput1);
    const input2 = new Uint32Array([
      0xdeadbeef, 0xcafebabe, 0xabad1dea, 0xdecaf123,
    ]);
    const expectedOutput2 = new Uint32Array([167216442, 4151007481, 0, 0]);
    keccakP160012(input2);
    expect(input2).toEqual(expectedOutput2);
  });

  it("should handle edge cases", () => {
    const inputEmpty = new Uint32Array([]);
    const expectedOutputEmpty = new Uint32Array([]);
    keccakP160012(inputEmpty);
    expect(inputEmpty).toEqual(expectedOutputEmpty);
    const inputZeros = new Uint32Array([0, 0, 0, 0]);
    const expectedOutputZeros = new Uint32Array([2147483648, 2147483648, 0, 0]);
    keccakP160012(inputZeros);
    expect(inputZeros).toEqual(expectedOutputZeros);

    const inputHashed = new Uint32Array([
      0xaabbccdd, 0xeeff0011, 0x22334455, 0x66778899,
    ]);
    const expectedOutputHashed = new Uint32Array([
      1859994743, 2718961955, 0, 0,
    ]);
    keccakP160012(inputHashed);
    expect(inputHashed).toEqual(expectedOutputHashed);
  });

});
