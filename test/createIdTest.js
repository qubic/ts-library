const { QubicHelper } = require('../dist/qubicHelper');

async function main() {

    const helper = new QubicHelper();

    const seed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
    const publicId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    
    const newId = await helper.createIdPackage(seed);

    console.assert(newId.publicId == publicId, "ID Generator failed");

    console.info("All Tests run");
}

main();