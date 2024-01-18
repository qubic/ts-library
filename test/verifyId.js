const { QubicHelper } = require('../dist/qubicHelper');
const { KeyHelper } = require('../dist/keyhelper');
const { PublicKey } = require('../dist/qubic-types/PublicKey');

async function main() {

    const helper = new QubicHelper();
    const toTestId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    const publicKey = KeyHelper.getIdentityBytes(toTestId);
    const idFromBytes = await helper.getIdentity(publicKey);

    console.assert(idFromBytes === toTestId, "ID is not valid (custom)");
    // positive test
    console.assert((await helper.verifyIdentity("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK")), "ID is not valid (library)");

    // negative test with correct length
    console.assert(!(await helper.verifyIdentity("SUZFFQSCAPHYYBDCQOREMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK")), "ID should not be valid (correct length)");
    

    // negative test with wrong length
    console.assert(!(await helper.verifyIdentity("SUZFFQSCAPHYYBDEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK")), "ID should not be valid (incorrect length)");

    // negative test with wrong length
    console.assert(!(await helper.verifyIdentity()), "ID should not be valid (undefined)");

    // test with PublicKey class
    const pKey = new PublicKey("SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK");
    console.assert((await pKey.verifyIdentity()), "ID is not valid (pulickey class)");

    console.info("All Tests run");
}

main();