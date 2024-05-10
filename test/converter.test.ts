import {
  bytesToShiftedHex,
  publicKeyStringToBytes,
  bytes32ToString,
  digestBytesToString,
  publicKeyBytesToString,
  seedStringToBytes,
} from "../dist/converter/converter";

describe("Converter Functions", () => {
  describe("bytesToShiftedHex", () => {
    it("converts bytes to shifted hexadecimal string", () => {
      const bytes = new Uint8Array([10, 20, 30, 40]);
      expect(bytesToShiftedHex(bytes)).toBe("AKBEBOCI");
    });
  });

  describe("publicKeyStringToBytes", () => {
    it("converts a public key string to bytes", () => {
      const publicKeyString =
        "ABCDEFGH12345678ABCDEFGH12345678ABCDEFGH12345678ABCDEFGH12345678ABCDEFGH12345678ABCDEFGH12345678ABCDEFGH12345678ABCDEFGH12345678";
      const expectedBytes = new Uint8Array([
        186, 178, 92, 48, 134, 178, 167, 116, 52, 114, 110, 60, 46, 87, 9, 45,
        38, 144, 61, 86, 244, 125, 175, 230, 248, 34, 26, 184, 22, 60, 61, 249,
      ]);
      expect(publicKeyStringToBytes(publicKeyString)).toEqual(expectedBytes);
    });
  });

  describe("bytes32ToString", () => {
    it("converts bytes to string", () => {
      const bytes = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      expect(bytes32ToString(bytes)).toBe(
        "vuvmvghudyzoccaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      );
    });
  });

  describe("digestBytesToString", () => {
    it("converts digest bytes to string", () => {
      const bytes = new Uint8Array([97, 98, 99, 100, 101, 102, 103, 104]);
      expect(digestBytesToString(bytes)).toBe(
        "dtuorhslfdsvadaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      );
    });
  });

  describe("publicKeyBytesToString", () => {
    it("converts public key bytes to string", () => {
      const bytes = new Uint8Array([97, 98, 99, 100, 101, 102, 103, 104]);
      expect(publicKeyBytesToString(bytes)).toBe(
        "DTUORHSLFDSVADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
      );
    });
  });

  describe("seedStringToBytes", () => {
    it("converts seed string to bytes", () => {
      const seedString = "abcdefgh";
      const expectedBytes = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(seedStringToBytes(seedString)).toEqual(expectedBytes);
    });
  });
});
