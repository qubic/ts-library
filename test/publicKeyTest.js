const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicHelper } = require('../dist/qubicHelper');

async function main() {

  const helper = new QubicHelper();

  const pkey = new Uint8Array(32);
  pkey.set([
    54, 175, 22, 213, 38, 91, 116, 67,
    215, 152, 137, 17, 34, 185, 26, 116,
    137, 55, 82, 16, 127, 224, 40, 108,
    69, 133, 107, 215, 147, 227, 57, 255
  ]);

  const expectedPublicId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";

  const publicKey = new PublicKey();
  await publicKey.setIdentity(pkey);


  console.assert(publicKey.getIdentityAsSring() === expectedPublicId, "Generated Identiy invalid");

  console.info("All Tests run");
}

main();