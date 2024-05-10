const { PublicKey } = require("../dist/qubic-types/PublicKey");
const {
  QubicPackageType,
} = require("../dist/qubic-communication/QubicPackageType");
const { QubicTransaction } = require("../dist/qubic-types/QubicTransaction");
const {
  RequestResponseHeader,
} = require("../dist/qubic-communication/RequestResponseHeader");
const { QubicPackageBuilder } = require("../dist/QubicPackageBuilder");

describe("createTransfer function", () => {
  const currentTick = 1000;
  const tickAddition = 50;
  async function createTransfer(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: number,
    signSeed: string,
    currentTick: number,
    tickAddition: number
  ) {
    const tx = new QubicTransaction()
      .setSourcePublicKey(sourcePublicKey)
      .setDestinationPublicKey(destinationPublicKey)
      .setAmount(amount)
      .setTick(currentTick + tickAddition);
    await tx.build(signSeed);

    const header = new RequestResponseHeader(
      QubicPackageType.BROADCAST_TRANSACTION,
      tx.getPackageSize()
    );
    const builder = new QubicPackageBuilder(header.getSize());
    builder.add(header);
    builder.add(tx);
    const data = builder.getData();

    return tx;
  }
  beforeEach(() => {});

  test("creates a valid transaction", async () => {
    const sourceKey = new PublicKey(
      "CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM"
    );
    const destKey = new PublicKey(
      "CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM"
    );
    const signSeed = "slkdfj";
    const expectedId =
      "xsjprlqqcoikyafpagvcjsbtnrtenfhizolbspflahaujwemfnvjrryeqbma";

    const tx = await createTransfer(
      sourceKey,
      destKey,
      0,
      signSeed,
      currentTick,
      tickAddition
    );

    expect(tx.id).toEqual(expectedId);
  });
});
