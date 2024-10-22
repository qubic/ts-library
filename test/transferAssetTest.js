const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');
const { Long } = require('../dist/qubic-types/Long');
const { QubicTransaction } = require('../dist/qubic-types/QubicTransaction');
const { RequestResponseHeader } = require('../dist/qubic-communication/RequestResponseHeader');
const { QubicPackageBuilder } = require('../dist/QubicPackageBuilder');
const { QubicDefinitions } = require('../dist/QubicDefinitions');
const { QubicTransferAssetPayload } = require('../dist/qubic-types/transacion-payloads/QubicTransferAssetPayload');

/**
 * Creates an asset transfer transaction.
 * 
 * @param {PublicKey} sourcePublicKey - The public key of the source.
 * @param {string} assetName - The name of the asset to be transferred.
 * @param {number} numberOfUnits - The number of units of the asset to be transferred.
 * @param {string} signSeed - The seed used to sign the transaction.
 * @returns {QubicTransaction} - The created and signed transaction.
 */
async function createAssetTransfer(sourcePublicKey, assetName, numberOfUnits, signSeed) {

  // Create a new asset transfer payload and set its properties
  const assetTransfer = new QubicTransferAssetPayload()
    .setIssuer(sourcePublicKey)
    .setNewOwnerAndPossessor(sourcePublicKey)
    .setAssetName(assetName)
    .setNumberOfUnits(numberOfUnits);

  // Build and sign the transaction
  const tx = new QubicTransaction().setSourcePublicKey(sourcePublicKey)
    .setDestinationPublicKey(QubicDefinitions.QX_ADDRESS) // A transfer should go to the QX SC
    .setAmount(QubicDefinitions.QX_TRANSFER_ASSET_FEE)
    .setTick(0) // Just a fake tick
    .setInputType(QubicDefinitions.QX_TRANSFER_ASSET_INPUT_TYPE)
    .setPayload(assetTransfer);

  await tx.build(signSeed);

  console.log("TX", tx);

  return tx;
}

// Define the source public key, signing seed, and expected transaction ID
const sourceKey = new PublicKey("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK");
const signSeed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
const expectedId = "lhuvrmqwusgaadwfwmklxjrfoczbuznxwbwbooaymcreplbzklmxmxgepznj";

/**
 * Main function to run the asset transfer test.
 */
async function main() {
  // Create the asset transfer transaction
  const tx = await createAssetTransfer(sourceKey, 0, 0, signSeed);

  // Assert that the transaction ID matches the expected ID
  console.assert(expectedId === tx.id, "TX ID INVALID");

  // Convert the transaction package data to base64 and log it
  var b64 = Buffer.from(tx.getPackageData()).toString('base64');
  console.log("B64", b64);

  console.log("All Tests run");
}

// Run the main function
main();