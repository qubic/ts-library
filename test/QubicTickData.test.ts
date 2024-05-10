import { QubicTickData } from "../dist/qubic-types/QubicTickData";

describe("QubicTickData", () => {
  let tickData: QubicTickData;

  beforeEach(() => {
    tickData = new QubicTickData();
  });

  it("should parse package data correctly", () => {
    const mockPackageData = new Uint8Array(41328);
    tickData.parse(mockPackageData);
  });
});
