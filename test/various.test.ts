import { PublicKey } from "../dist/qubic-types/PublicKey";

async function CreatePublicKey() {
  const id = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const pKey = new PublicKey(id);
  console.log(pKey);
}

test("Create PublicKey", async () => {
  CreatePublicKey();
});
