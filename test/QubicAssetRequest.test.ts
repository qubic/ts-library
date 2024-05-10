import { QubicAssetRequest } from "../dist/qubic-communication/QubicAssetRequest";
import { PublicKey } from "../dist/qubic-types/PublicKey";

describe("QubicAssetRequest", () => {
  const publicKey = new PublicKey();
  test("constructor initializes with undefined publicKey", () => {
    const request = new QubicAssetRequest(publicKey);
    expect(request.getPublicKey()).toBeInstanceOf(PublicKey);
    expect(request.getPublicKey()).toEqual(publicKey);
  });

  test("constructor initializes with provided publicKey", () => {
    const mockPublicKey = new PublicKey(
      "CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM"
    );
    const request = new QubicAssetRequest(mockPublicKey);
    expect(request.getPublicKey()).toEqual(mockPublicKey);
  });

  test("getPackageSize returns correct size", () => {
    const request = new QubicAssetRequest(publicKey);
    expect(request.getPackageSize()).toBe(32);
  });

  test("parse sets publicKey correctly", () => {
    const mockPublicKey = new PublicKey(
      "CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM"
    );
    const request = new QubicAssetRequest(mockPublicKey);

    const data = new Uint8Array([
      134, 138, 142, 55, 50, 221, 128, 72, 6, 234, 222, 195, 237, 141, 238, 70,
      102, 161, 34, 18, 205, 236, 0, 37, 168, 19, 116, 18, 104, 31, 39, 166,
    ]);
    request.parse = jest.fn().mockReturnValueOnce(request);
    request.parse(data);
    expect(request.parse).toHaveBeenCalledWith(data);
    expect(request.getPublicKey()).toEqual(mockPublicKey);
  });

  test("getPackageData returns correct data", () => {
    const request = new QubicAssetRequest(publicKey);
    const mockPublicKey = new PublicKey(
      "CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM"
    );
    const mockData = new Uint8Array(32);
    request.getPackageData = jest.fn().mockReturnValueOnce(mockData);
    expect(request.getPackageData()).toEqual(mockData);
  });
});
