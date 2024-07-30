import { QubicHelper } from "../dist/qubicHelper";

/**
 * Test case to verify the generation of a public ID using QubicHelper.
 */
test('Generate Address', async () => {
    // Create an instance of QubicHelper
    const helper = new QubicHelper();

    // Define the seed and the expected public ID
    const seed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
    const publicId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";

    // Generate a new ID package using the seed
    const newId = await helper.createIdPackage(seed);

    // Assert that the generated public ID matches the expected public ID
    expect(newId.publicId).toBe(publicId);
});