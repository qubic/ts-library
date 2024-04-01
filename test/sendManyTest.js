const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');
const { Long } = require('../dist/qubic-types/Long');
const { QubicTransaction } = require('../dist/qubic-types/QubicTransaction');
const { RequestResponseHeader } = require('../dist/qubic-communication/RequestResponseHeader');
const { QubicPackageBuilder } = require('../dist/QubicPackageBuilder');
const { QubicDefinitions } = require('../dist/QubicDefinitions');
const { QubicTransferSendManyPayload } = require('../dist/qubic-types/transacion-payloads/QubicTransferSendManyPayload');


/**
 * sample on how to create a send many request
 * 
 * @param {*} sourcePublicKey 
 * @param {*} signSeed 
 * @returns 
 */
async function createSendManyTransfer(sourcePublicKey, signSeed) {


  const sendManyPayload = new QubicTransferSendManyPayload();

  // add a destination
  sendManyPayload.addTransfer({
    destId: new PublicKey("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK"),
    amount: new Long(1)
  });

  // add a destination
  sendManyPayload.addTransfer({
    destId: new PublicKey("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK"),
    amount: new Long(2)
  });

  // add the fixed fee to the total amount
  const totalAmount = sendManyPayload.getTotalAmount() + BigInt(QubicDefinitions.QUTIL_SENDMANY_FEE);

  // build and sign tx
  const tx = new QubicTransaction().setSourcePublicKey(sourcePublicKey)
    .setDestinationPublicKey(QubicDefinitions.QUTIL_ADDRESS) // a transfer should go the Qutil SC
    .setAmount(totalAmount)
    .setTick(0) // just a fake tick
    .setInputType(QubicDefinitions.QUTIL_SENDMANY_INPUT_TYPE)
    .setInputSize(sendManyPayload.getPackageSize())
    .setPayload(sendManyPayload);

  await tx.build(signSeed);

  //console.log("TX", tx);

  return tx;
}

const sourceKey = new PublicKey("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK");
const signSeed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
const expectedId = "ocggdjgthzbehflnkfecyssgzyjexsmgpjrrvbcdyctxjhiuiqwooroflzml";

async function main() {
  const tx = await createSendManyTransfer(sourceKey, signSeed);

  console.assert(expectedId === tx.id, "TX ID INVALID");

  const b64 = Buffer.from(tx.getPackageData()).toString('base64');
  //console.log("B64", b64);

  // parse test
  const newPayload = tx.getPayload().getPackageData();
  const parsedSendManyPayload = await new QubicTransferSendManyPayload().parse(newPayload);

  const transfers = await parsedSendManyPayload.getTransfers();

  //console.log("Transfers", transfers);

  console.assert(transfers[0].destId.getIdentityAsSring() === 'SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK', "Destination id 0 wrong")

  console.assert(transfers[0].amount.getNumber() === 1n, "Amount of first transfer is wrong")
  console.assert(transfers[1].amount.getNumber() === 2n, "Amount of second transfer is wrong")

  console.log("All Tests run");
}

main();