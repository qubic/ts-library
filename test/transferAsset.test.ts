const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');
const { Long } = require('../dist/qubic-types/Long');
const { QubicTransaction } = require('../dist/qubic-types/QubicTransaction');
const { RequestResponseHeader } = require('../dist/qubic-communication/RequestResponseHeader');
const { QubicPackageBuilder } = require('../dist/QubicPackageBuilder');
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

  return tx;
}

const sourceKey = new PublicKey("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK");
const signSeed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
const expectedId = "lbidszodfmnjchzixlylhjrolipesxujxihhyofnkfhqajjzvztpdyydpfgf";

async function main() {
  const tx = await createAssetTransfer(sourceKey, 0, 0, signSeed);

  expect(tx.id).toBe(expectedId);
}

test('Create and Sign Asset Transfer Package', async () => {

  main();

});

test('Convert assetName to byte array', async () => {

  const assetName = "QX";
  const assetNameInBytes = new Uint8Array(8);
  assetNameInBytes.forEach(element => {
    element = 0;
  });

  assetNameInBytes[0] = 81;
  assetNameInBytes[1] = 88;

  const assetTransfer = new QubicTransferAssetPayload()
    .setAssetName(assetName);

  console.log("NAME", assetTransfer.getAssetName());

  // compare bytes
  let isEqual = true;
  assetNameInBytes.forEach((b, i) => {
    isEqual = isEqual && b == assetTransfer.getAssetName()[i];
  });

  expect(isEqual).toBe(true);

});