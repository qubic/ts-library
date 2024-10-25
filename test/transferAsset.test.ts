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
const expectedId = "edfpxfqxcslxjcjvmhxkqiwmmtmebuldxgzeoseijepwzhkrxzhdkyqcqxvd";

async function main() {
  const tx = await createAssetTransfer(sourceKey, 0, 0, signSeed);

  expect(tx.id).toBe(expectedId);
}

async function parseAssetTransferPayload() {
  const inputHex = "0830bb63bf7d5e164ac8cbd38680630ff7670a1ebf39f7210b40bcdca253d05f9c63048ada9c009877ee2a0aecd6221a94078c462ddde2dce4f41463052cf7af434642000000000000286bee00000000";
  const binaryData = new Uint8Array(inputHex.match(/.{1,2}/g)?.map((pair) => parseInt(pair, 16)) ?? []);

  const parsedPayload = await new QubicTransferAssetPayload().parse(binaryData);

  expect(parsedPayload.getIssuer().getIdentityAsSring()).toBe("CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL");
  expect(parsedPayload.getNewOwnerAndPossessor().getIdentityAsSring()).toBe("QAZFCTNGZJEUKEXCFHWMETVYCTTAKVGUHUEFLONUKGGVXKLKUVGEQWCFWVWE");

  let decoder = new TextDecoder(); // Create a TextDecoder for UTF-8 by default
  let assetName = decoder.decode(parsedPayload.assetName); // Convert Uint8Array to string
  assetName = assetName.replace(/\0/g, '');  // Remove null characters

  expect(assetName).toBe("CFB");

  // it's casted to string so the printed result is readable in the case of error
  expect(parsedPayload.getNumberOfUnits().getNumber().toString()).toBe('4000000000');
}

test('Create and Sign Asset Transfer Package', async () => {
  await main();
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

  // compare bytes
  let isEqual = true;
  assetNameInBytes.forEach((b, i) => {
    isEqual = isEqual && b == assetTransfer.getAssetName()[i];
  });

  expect(isEqual).toBe(true);

});

test('Parse Asset Transfer Payload', async () => {

  await parseAssetTransferPayload();

});