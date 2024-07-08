import { QubicEntityResponse } from "../dist/qubic-communication/QubicEntityResponse";
import { QubicEntity } from "../dist/qubic-types/QubicEntity";

describe("QubicEntityResponse", () => {
  let response: QubicEntityResponse;

  beforeEach(() => {
    response = new QubicEntityResponse();
  });

  it("should initialize with default values", () => {
    expect(response.getEntity()).toEqual(new QubicEntity());
    expect(response.getTick()).toBe(0);
    expect(response.getSpectrumIndex()).toBe(0);
    expect(response.getSiblings()).toEqual(new Uint8Array());
  });

  it("should set and get entity", () => {
    const entity = new QubicEntity();
    response.setEntity(entity);
    expect(response.getEntity()).toBe(entity);
  });

  it("should set and get tick", () => {
    response.setTick(100);
    expect(response.getTick()).toBe(100);
  });

  it("should set and get spectrum index", () => {
    response.setSpectrumIndex(5);
    expect(response.getSpectrumIndex()).toBe(5);
  });

  it("should set and get siblings", () => {
    const siblings = new Uint8Array([1, 2, 3, 4, 5]);
    response.setSiblings(siblings);
    expect(response.getSiblings()).toEqual(siblings);
  });

  it("should calculate package size correctly", () => {
    expect(response.getPackageSize()).toBe(840);
  });
});
