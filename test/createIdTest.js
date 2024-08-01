const { QubicHelper } = require('../dist/qubicHelper');

/**
 * Main function to test the ID generation using QubicHelper.
 */
async function main() {

    // Create an instance of QubicHelper
    const helper = new QubicHelper();

    // Define the seed and the expected public ID
    const seed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
    const publicId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";
    
    // Generate a new ID package using the seed
    const newId = await helper.createIdPackage(seed);

    // Assert that the generated public ID matches the expected public ID
    console.assert(newId.publicId == publicId, "ID Generator failed");

    // Log a message indicating that all tests have run
    console.info("All Tests run");
}

// Execute the main function
main();