import { QubicEntityRequest } from "../dist/qubic-communication/QubicEntityRequest";
import { PublicKey } from "../dist/qubic-types/PublicKey";

describe("QubicEntityRequest", () => {
  test("constructor sets publicKey if provided", () => {
    const publicKey = new PublicKey();
    const request = new QubicEntityRequest(publicKey);
    expect(request.getPublicKey()).toEqual(publicKey);
  });

  test("getPublicKey and setPublicKey work correctly", () => {
    const publicKey1 = new PublicKey();
    const publicKey2 = new PublicKey();
    const request = new QubicEntityRequest(publicKey1);
    request.setPublicKey(publicKey1);
    expect(request.getPublicKey()).toEqual(publicKey1);
    request.setPublicKey(publicKey2);
    expect(request.getPublicKey()).toEqual(publicKey2);
  });

  test("getPackageSize returns correct package size", () => {
    const publicKey = new PublicKey();
    const request = new QubicEntityRequest(publicKey);
    expect(request.getPackageSize()).toBe(32);
  });

  test("parse correctly parses data", () => {
    const publicKeyData = new Uint8Array(32);
    const request = new QubicEntityRequest(new PublicKey());
    const parsedRequest = request.parse(publicKeyData);
    expect(parsedRequest).toBeInstanceOf(QubicEntityRequest);
    expect(parsedRequest!.getPublicKey().getPackageData()).toEqual(
      publicKeyData
    );
  });

  test("getPackageData returns correct package data", () => {
    const publicKey = new PublicKey();
    const request = new QubicEntityRequest(publicKey);
    const packageData = request.getPackageData();
    expect(packageData).toBeInstanceOf(Uint8Array);
    expect(packageData.length).toBe(32);
  });
});
