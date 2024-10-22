import { QubicHelper } from "../dist/qubicHelper";

test('Generate Proposal', async () => {
    const helper = new QubicHelper();

    const seed = "wqbdupxgcaimwdsnchitjmsplzclkqokhadgehdxqogeeiovzvadstt";
    const publicId = "SUZFFQSCVPHYYBDCQODEMFAOKRJDDDIRJFFIWFLRDDJQRPKMJNOCSSKHXHGK";

    const proposal = await helper.createProposal(1,1,seed, 'localhost');

    expect(proposal).toBeInstanceOf(Uint8Array);
});