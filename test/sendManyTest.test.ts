import { PublicKey } from "../dist/qubic-types/PublicKey";
import { Long } from "../dist/qubic-types/Long";
import { QubicTransaction } from "../dist/qubic-types/QubicTransaction";
import { QubicTransferSendManyPayload } from "../dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload";
import { QubicDefinitions } from "../dist/QubicDefinitions";

jest.mock("buffer", () => ({
  from: () => ({
    toString: () => "mocked-base64",
  }),
}));

describe("Qubic Transaction Creation", () => {
  it("should create a Qubic transaction with correct details", async () => {
    const sourceKey = new PublicKey(
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK"
    );
    const signSeed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
    const expectedId =
      "xtxxbucncizvfaijavqbswgofoebevorfrkxieztnfoanfplvrqzvmserxch";

    const tx = await createSendManyTransfer(sourceKey, signSeed);

    expect(expectedId).toEqual(tx.id);
    const newPayload = tx.getPayload().getPackageData();
    const parsedSendManyPayload =
      await new QubicTransferSendManyPayload().parse(newPayload);
    const transfers = await parsedSendManyPayload.getTransfers();

    expect(transfers[0].destId.getIdentityAsSring()).toEqual(
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK"
    );

    expect(transfers[0].amount.getNumber()).toEqual(222314422n);
    expect(transfers[1].amount.getNumber()).toEqual(323214525n);
  });
});

/**
 *
 * @param sourcePublicKey
 * @param signSeed
 * @returns
 */
async function createSendManyTransfer(
  sourcePublicKey: PublicKey,
  signSeed: string
): Promise<QubicTransaction> {
  const sendManyPayload = new QubicTransferSendManyPayload();

  sendManyPayload.addTransfer({
    destId: new PublicKey(
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK"
    ),
    amount: new Long(222314422),
  });

  sendManyPayload.addTransfer({
    destId: new PublicKey(
      "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK"
    ),
    amount: new Long(323214525),
  });

  const totalAmount =
    sendManyPayload.getTotalAmount() +
    BigInt(QubicDefinitions.QUTIL_SENDMANY_FEE);

  const tx = new QubicTransaction()
    .setSourcePublicKey(sourcePublicKey)
    .setDestinationPublicKey(QubicDefinitions.QUTIL_ADDRESS)
    .setAmount(totalAmount)
    .setInputType(QubicDefinitions.QUTIL_SENDMANY_INPUT_TYPE)
    .setInputSize(sendManyPayload.getPackageSize())
    .setPayload(sendManyPayload);

  await tx.build(signSeed);
  return tx;
}
