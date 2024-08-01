const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');
const { QubicTransaction } = require('../dist/qubic-types/QubicTransaction');
const { RequestResponseHeader } = require('../dist/qubic-communication/RequestResponseHeader');
const { QubicPackageBuilder } = require('../dist/QubicPackageBuilder');

/**
 * Function to create and sign a transfer transaction.
 * 
 * @param {PublicKey} sourcePublicKey - The public key of the source account.
 * @param {PublicKey} destinationPublicKey - The public key of the destination account.
 * @param {number} amount - The amount to be transferred.
 * @param {string} signSeed - The seed used to sign the transaction.
 * @returns {QubicTransaction} - The created and signed transaction.
 */
async function createTransfer(sourcePublicKey, destinationPublicKey, amount, signSeed) {

    // Build and sign the transaction
    const tx = new QubicTransaction().setSourcePublicKey(sourcePublicKey)
      .setDestinationPublicKey(destinationPublicKey)
      .setAmount(amount)
      .setTick(this.currentTick + this.tickAddition);
    await tx.build(signSeed);

    // Prepare the transaction for sending
    const header = new RequestResponseHeader(QubicPackageType.BROADCAST_TRANSACTION, tx.getPackageSize());
    const builder = new QubicPackageBuilder(header.getSize());
    builder.add(header);
    builder.add(tx);
    const data = builder.getData();

    return tx;
}

// Define the source and destination public keys, signing seed, and expected transaction ID
const sourceKey = new PublicKey("CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM");
const destKey = new PublicKey("CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM");
const signSeed = "slkdfj";
const expectedId = "fvsgxeepltopsdxmaxfzsnxgstyfemwosgauatxmldydwrshezpghqfgeuxe";

/**
 * Main function to execute the transfer transaction test.
 */
async function main(){
    const tx = await createTransfer(sourceKey, destKey, 0, signSeed);
    
    console.log("TX", tx);

    // Assert that the generated transaction ID matches the expected ID
    console.assert(expectedId === tx.id, "TX ID INVALID");

    console.log("All Tests run");
}

// Execute the main function
main();