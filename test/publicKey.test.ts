import { PublicKey } from "qubic-ts-library/dist/qubic-types/PublicKey";

describe("PublicKey is Okay", () => {
  it("Generated Identiy invalid", async () => {
    const pkey = new Uint8Array(32);
    pkey.set([
      54, 175, 22, 213, 38, 91, 116, 67, 215, 152, 137, 17, 34, 185, 26, 116,
      137, 55, 82, 16, 127, 224, 40, 108, 69, 133, 107, 215, 147, 227, 57, 255,
    ]);
    const expectedPublicId =
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    const publicKey = new PublicKey();
    await publicKey.setIdentity(pkey);
    expect(publicKey.getIdentityAsSring()).toBe(expectedPublicId);
  });
});
