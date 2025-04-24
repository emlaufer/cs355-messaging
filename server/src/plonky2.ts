import { init, verify_plonky2_ring_rsa_proof } from 'plonky2_rsa_wasm_verify';

async function verifyProof(
  proof: string,
  verifierData: string,
  common: string,
  public_inputs: string[],
) {
  await init();

  const result: boolean = verify_plonky2_ring_rsa_proof(proof, verifierData, common, public_inputs);
  return result;
}

export default verifyProof;
