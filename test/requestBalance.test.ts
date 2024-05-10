import { QubicConnector } from "../dist/QubicConnectorNode";
import { PublicKey } from "../dist/qubic-types/PublicKey";

describe("QubicConnector", () => {
  let qubicConnector = new QubicConnector();
  const ids = ["AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"];

  afterEach(() => {
    qubicConnector.destroy();
  });

  it("should create a QubicConnector instance", () => {
    expect(qubicConnector).toBeInstanceOf(QubicConnector);
  });

  it("should connect to a peer", () => {
    const ip = "82.103.129.80";
    qubicConnector.connect(ip);
  });

  it("should send a package", () => {
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    expect(qubicConnector.sendPackage(data)).toBe(false);
  });

  it("should request balance for a given public key", async () => {
    ids.forEach(async (id) => {
      await expect(qubicConnector.requestBalance(new PublicKey(id)));
    });
  });
});
