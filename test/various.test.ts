import { PublicKey } from "../dist/qubic-types/PublicKey";

/**
 * Asynchronously creates a PublicKey object and logs it to the console.
 */
async function CreatePublicKey(){
    // Define a sample public key ID
    const id = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    // Create a new PublicKey object using the provided ID
    const pKey = new PublicKey(id);

    // Log the created PublicKey object to the console
    console.log(pKey);
}

/**
 * Test case for creating a PublicKey object.
 */
test('Create PublicKey', async () => {
    // Call the CreatePublicKey function to create and log the PublicKey object
    await CreatePublicKey();
});