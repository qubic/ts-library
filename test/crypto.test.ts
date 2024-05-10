import crypto from "../dist/crypto/index";

describe("Crypto functions", () => {
  describe("Schnorrq", () => {
    it("should generate public key from secret key", async () => {
      const secretKey = new Uint8Array([1, 2, 3, 4, 5]);
      const publicKey = await crypto.then((c) =>
        c.schnorrq.generatePublicKey(secretKey)
      );
      expect(publicKey.length).toBe(32);
    });

    it("should sign and verify a message", async () => {
      const secretKey = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      const publicKey = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      const message = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      const signature = await crypto.then((c) =>
        c.schnorrq.sign(secretKey,publicKey, message)
      );
      const isValid = await crypto.then((c) =>
        c.schnorrq.verify(publicKey, message, signature)
      );
      expect(isValid).toBe(0);
    });
  });

  describe("Kex", () => {
    it("should generate compressed public key from secret key", async () => {
      const secretKey = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      const compressedPublicKey = await crypto.then((c) =>
        c.kex.generateCompressedPublicKey(secretKey)
      );
      expect(compressedPublicKey.length).toBe(32);
    });

    it("should generate shared key from secret key and public key", async () => {
      const secretKey = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      const publicKey = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      const sharedKey = await crypto.then((c) =>
        c.kex.compressedSecretAgreement(secretKey, publicKey)
      );
      expect(sharedKey.length).toBe(32);
    });
  });

  describe("K12", () => {
    it("should hash the input", async () => {
      const input = new Uint8Array([65, 66, 67, 68, 69, 70, 71, 72]);
      const output = new Uint8Array(32); 
      await crypto.then((c) => c.K12(input, output, output.length));
    });
  });

  describe("KECCAK_STATE_LENGTH", () => {
    it("should be 200", async () => {
      const keccakStateLength = await crypto.then((c) => c.KECCAK_STATE_LENGTH);
      expect(keccakStateLength).toBe(200);
    });
  });
});
