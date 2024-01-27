import { QubicHelper } from "../dist/qubicHelper";



test('Generate Address', async () => {
    const helper = new QubicHelper();

    const seed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
    const publicId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";

    const newId = await helper.createIdPackage(seed);

    expect(newId.publicId).toBe(publicId);
});