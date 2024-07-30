const { PublicKey } = require('../dist/qubic-types/PublicKey');
const { QubicHelper } = require('../dist/qubicHelper');

/**
 * Main function to test the public key identity generation using QubicHelper.
 */
async function main() {

  // Create an instance of QubicHelper
  const helper = new QubicHelper();

  // Define a 32-byte public key array
  const pkey = new Uint8Array(32);
  pkey.set([
    54, 175, 22, 213, 38, 91, 116, 67,
    215, 152, 137, 17, 34, 185, 26, 116,
    137, 55, 82, 16, 127, 224, 40, 108,
    69, 133, 107, 215, 147, 227, 57, 255
  ]);

  // Define the expected public ID
  const expectedPublicId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";

  // Create an instance of PublicKey and set its identity
  const publicKey = new PublicKey();
  await publicKey.setIdentity(pkey);

  // Assert that the generated public ID matches the expected public ID
  console.assert(publicKey.getIdentityAsSring() === expectedPublicId, "Generated Identity invalid");

  // Log a message indicating that all tests have run
  console.info("All Tests run");
}

// Execute the main function
main();