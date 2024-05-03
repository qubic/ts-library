import { PublicKey } from "../dist/qubic-types/PublicKey";

const { QubicHelper } = require("../dist/qubicHelper");
const { KeyHelper } = require("../dist/keyhelper");

describe("QubicHelper", () => {
  const helper = new QubicHelper();

  it("should correctly validate identity with valid ID", async () => {
    const toTestId =
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    const publicKey: PublicKey = KeyHelper.getIdentityBytes(toTestId);
    const idFromBytes = await helper.getIdentity(publicKey);

    expect(idFromBytes).toBe(toTestId);
  });

  it("should validate identity with valid ID (library)", async () => {
    const toTestId =
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    const isValid = await helper.verifyIdentity(toTestId);

    expect(isValid).toBeTruthy();
  });

  it("should not validate identity with incorrect ID length", async () => {
    const invalidId =
      "SUZFFQSCAPHYYBDCQOREMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    const isValid = await helper.verifyIdentity(invalidId);

    expect(isValid).toBeFalsy();
  });

  it("should not validate identity with undefined ID", async () => {
    const isValid = await helper.verifyIdentity();

    expect(isValid).toBeFalsy();
  });
});

describe("PublicKey", () => {
  it("should validate identity with valid ID", async () => {
    const toTestId =
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    const pKey = new PublicKey(toTestId);
    const isValid = await pKey.verifyIdentity();

    expect(isValid).toBeTruthy();
  });
});
