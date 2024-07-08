import { RequestResponseHeader } from "../dist/qubic-communication/RequestResponseHeader";

describe("RequestResponseHeader", () => {
  let header: RequestResponseHeader;

  beforeEach(() => {
    header = new RequestResponseHeader();
  });

  it("should initialize with default values if no parameters are provided", () => {
    expect(header.getSize()).toBe(8);
    expect(header.getType()).toBe(0);
    expect(header.getDejaVu()).toBe(0);
  });

  it("should set type correctly", () => {
    header.setType(1);
    expect(header.getType()).toBe(1);
  });

  it("should set size correctly", () => {
    header.setSize(100);
    expect(header.getSize()).toBe(100);
  });

  it("should set dejaVu correctly", () => {
    header.setDejaVu(12345);
    expect(header.getDejaVu()).toBe(12345);
  });

  it("should randomize dejaVu correctly", () => {
    header.randomizeDejaVu();
    expect(header.getDejaVu()).not.toBe(0);
  });

  it("should calculate package size correctly", () => {
    const packageSize = header.getPackageSize();
    expect(packageSize).toBe(8);
  });

  it("should parse data correctly", () => {
    const data = new Uint8Array([8, 0, 0, 1, 0, 0, 0, 0]);
    const parsedHeader = header.parse(data);
    expect(parsedHeader).toBeInstanceOf(RequestResponseHeader);
    expect(parsedHeader?.getSize()).toBe(8);
    expect(parsedHeader?.getType()).toBe(1);
    expect(parsedHeader?.getDejaVu()).toBe(8);
  });

  it("should throw error for invalid package size during parsing", async () => {
    console.error = jest.fn();
    const invalidData = new Uint8Array([1, 2, 3, 4, 5, 6, 7]);
    const result = await header.parse(invalidData);
    expect(console.error).toHaveBeenCalledWith("INVALID PACKAGE SIZE");
    expect(result).toBe(undefined);
  });

  it("should generate package data correctly", () => {
    const expectedData = new Uint8Array([8, 0, 0, 0, 0, 0, 0, 0]);
    const generatedData = header.getPackageData();
    expect(generatedData).toEqual(expectedData);
  });
});
