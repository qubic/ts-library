const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicPackageType } = require('../dist/qubic-communication/QubicPackageType');
const { QubicTransaction } = require('../dist/qubic-types/QubicTransaction');
const { RequestResponseHeader } = require('../dist/qubic-communication/RequestResponseHeader');
const { QubicPackageBuilder } = require('../dist/QubicPackageBuilder');


async function createTransfer(sourcePublicKey, destinationPublicKey, amount, signSeed) {

    // build and sign tx
    const tx = new QubicTransaction().setSourcePublicKey(sourcePublicKey)
      .setDestinationPublicKey(destinationPublicKey)
      .setAmount(amount)
      .setTick(this.currentTick + this.tickAddition);
    await tx.build(signSeed);

    // send tx
    const header = new RequestResponseHeader(QubicPackageType.BROADCAST_TRANSACTION, tx.getPackageSize())
    const builder = new QubicPackageBuilder(header.getSize());
    builder.add(header);
    builder.add(tx);
    const data = builder.getData();

    return tx;
  }

  const sourceKey = new PublicKey("CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM");
  const destKey = new PublicKey("CSOXIPNXRTKTCCOEQYNGUOGPOOBCUXZJNOULAFMYBBEUHCHLUZFJZLVEOPGM");
  const signSeed = "slkdfj";
  const expectedId = "fvsgxeepltopsdxmaxfzsnxgstyfemwosgauatxmldydwrshezpghqfgeuxe";

  async function main(){
    const tx = await createTransfer(sourceKey, destKey, 0, signSeed);
    
    console.log("TX", tx);

    console.assert(expectedId === tx.id, "TX ID INVALID");

    console.log("All Tests run");
  }

  main();