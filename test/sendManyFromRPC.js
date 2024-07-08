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
  // const tx = await createSendManyTransfer(sourceKey, signSeed);

  // console.assert(expectedId === tx.id, "TX ID INVALID");

  // const b64 = Buffer.from(tx.getPackageData()).toString('base64');
  // //console.log("B64", b64);

  // // parse test
  // const newPayload = tx.getPayload().getPackageData();

  const hex = "503976a400daec93a1037d965e8dc4113d9e3f2068bf0730e918220c317e3c8d5d84abfc68d85e72f6eee9351c5fa54530e8d94e1e459022dcea1038f5cea2132c0cd62112de686b933b1ba62d4e1e18e5d812540ed864cf4a625ec8898be68c428c4a53ef286e8b4579047745d87264bae0a46fdcd34ff4f6a29f23ab95d1217b107d4811db0b00ef8b146ffb34905c6f6db3ab898f63d168baebbca4b579577e2caea033705ebe5b937980ca10cd3999deae6816a7fedf70fe2ac2274912cf7820be258ff5cbdc062f852ad450223df306b4e0d17a3195a541222df21c88f864f1ec8608a143d55ea147087834926b926ab5628a1c1106f4d4522522997704fbc0747782f1e40e382e81f76337373644bce95826f7cccb4606ccbce9e144b546502983fe47a1ccb1ac300a77260a58603a5d0028560e344f162ba099835b731c540f7e9a5ae8f8651c23a4455e6508045e70bd2d879fd5b7d0cf7781bf49aae08cd43dcd7dea8ada81ec4706d64f44e0eff2628a9e132e752add6c3553090d860d689ac683d3443c14105902fbd020a8a7356c264058317a9938f8dfdb6d46f2b3143e35b4ef357f1b63cc1d22bf762b4defad3852de73d909946513bbf5c5268bfc4eca1ecc3083b222b23dd60117ca28eeeb3d869fb5e3cc2b4d7e4e98a7a023fa425e8e8ca61e167d5666f4f04d536f2f51dc1dc38d09e3cd49dfdadc20350df07fa4fefc9dedede325ffef5f2730f964ab9581d073a64bcfa70e992aea1d7a3597d5e6786e9c0bfef05a3d6e2dccfba9a33756ce720db14c417399255ce4cd87e0685e3a0c40380fc9d7f34a73b0e8d7a389fa5055c8ee86c479da576380725d4de68fe936f3042e14a2534227ea4a35ba955176882b9ecb76b4d864814b0cceebc06d3dbca1c8e2c1ef65514dcd3b210c5032470e9393bef6623b8a6794629301f4a0dad951e4b0ab8676791cf24dbf0fca51289735b3f9af2477957e1cc2ec33576895d782e6be7da22c987e31025a163938872ff23f4de4b656b17140d75dac74d721c640f885043f2f903e898fdd72ba643cdddd26da2140c134d73a05edf8f5857c3ac1fd56c9d04a1e5f8b31f47adb8691ee36411fd0142f6f153c3fc800000000007d741500000000001b9479000000000041569d000000000020ab4e00000000003c6018020000000026c2230000000000fae82a00000000007d74150000000000becab200000000007d74150000000000506b780900000000787e900100000000ae85330100000000b9b3dd00000000003c72140e00000000fae82a0000000000476d720000000000fc4b1b0400000000a336390000000000a84d0e00000000000b704a0200000000d7cb97060000000075ebfb0600000000d426070000000000";
  const input = Buffer.from(hex, "hex");
  const fromHexString = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const input2 = fromHexString(hex)
  const parsedSendManyPayload = await new QubicTransferSendManyPayload().parse(input2);

  const transfers = await parsedSendManyPayload.getTransfers();

  console.log("Transfers", transfers);

  //console.assert(transfers[0].destId.getIdentityAsSring() === 'SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK', "Destination id 0 wrong")

  // console.assert(transfers[0].amount.getNumber() === 1n, "Amount of first transfer is wrong")
  // console.assert(transfers[1].amount.getNumber() === 2n, "Amount of second transfer is wrong")

  console.log("All Tests run");
}

main();