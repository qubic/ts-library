import { QubicPackageType } from "../dist/qubic-communication/QubicPackageType";

const { QubicConnector } = require("../dist/QubicConnector");
const {
  QubicEntityResponse,
} = require("../dist/qubic-communication/QubicEntityResponse");

describe("QubicConnector Tests", () => {
  let connector;

  beforeEach(() => {
    connector = new QubicConnector();
  });

  test("Test request balances", async () => {
    const ids = [
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    ];
    const peerAddress = "65.109.66.49";
    const balanceResponse = new QubicEntityResponse();

    connector.onReady = () => {
      connector.connect(peerAddress);
    };

    connector.onBalance = (b) => {
      if (b && b.entity && b.entity.incomingAmount && b.entity.outgoingAmount) {
        connector.onPackageReceived({
          header: { type: QubicPackageType.RESPOND_ENTITY },
          payLoad: balanceResponse,
        });
      }
    };

    connector.onPeerDisconnected = () => {
      expect(connector.onBalance).toHaveBeenCalledTimes(ids.length);
      expect(balanceResponse.entity.getBalance).toHaveBeenCalledTimes(
        ids.length
      );
    };
  });
});
