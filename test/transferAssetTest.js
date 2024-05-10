const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicTransaction } = require('../dist/qubic-types/QubicTransaction');
const { QubicDefinitions } = require('../dist/QubicDefinitions');
const { QubicTransferAssetPayload } = require('../dist/qubic-types/transacion-payloads/QubicTransferAssetPayload');


async function createAssetTransfer(sourcePublicKey, assetName, numberOfUnits, signSeed) {


  const assetTransfer = new QubicTransferAssetPayload()
    .setIssuer(sourcePublicKey)
    .setNewOwnerAndPossessor(sourcePublicKey)
    .setAssetName(assetName)
    .setNumberOfUnits(numberOfUnits);


  // build and sign tx
  const tx = new QubicTransaction().setSourcePublicKey(sourcePublicKey)
    .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS) // a transfer should go the QX SC
    .setAmount(QubicDefinitions.QX_TRANSFER_ASSET_FEE)
    .setTick(0) // just a fake tick
    .setInputType(QubicDefinitions.QX_TRANSFER_ASSET_INPUT_TYPE)
    .setPayload(assetTransfer);

  await tx.build(signSeed);

  console.log("TX", tx);

  return tx;
}

const sourceKey = new PublicKey("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK");
const signSeed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
const expectedId = "lhuvrmqwusgaadwfwmklxjrfoczbuznxwbwbooaymcreplbzklmxmxgepznj";

async function main() {
  const tx = await createAssetTransfer(sourceKey, 0, 0, signSeed);

  console.assert(expectedId === tx.id, "TX ID INVALID");

  var b64 = Buffer.from(tx.getPackageData()).toString('base64');
  console.log("B64", b64);

  console.log("All Tests run");
}

main();