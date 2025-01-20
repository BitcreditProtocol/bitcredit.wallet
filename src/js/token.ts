import {
  type Token,
  getDecodedToken,
  getEncodedBitcreditTokenV3,
} from "@cashu/cashu-ts";
import { useMintsStore, WalletProof } from "src/stores/mints";
import { useProofsStore } from "src/stores/proofs";
export default { decode, getProofs, getMint, getUnit, getMemo };

/**
 * Decodes an encoded cashu token
 */
function decode(encoded_token: string) {
  if (!encoded_token || encoded_token === "") return;

  try {
    const decoded_token = getDecodedToken(encoded_token);

    // temporarily adapt token and output it to console if token is of unit "crsat" but does not point to an ebill mint
    if (decoded_token.unit === "crsat" && decoded_token.proofs.length > 0) {
      const bill_id = decoded_token.proofs[0].id.slice(2);
      const isEbillMint = decoded_token.mint.includes(`/${bill_id}/cr-sat`);
      if (!isEbillMint) {
        decoded_token.mint = `${decoded_token.mint.replace(
          "bitcredit_mint",
          "localhost"
        )}/${bill_id}/cr-sat`;
        const newly_encoded_token = getEncodedBitcreditTokenV3(decoded_token);
        console.log(newly_encoded_token);
      }
    }

    return decoded_token;
  } catch (e) {
    console.log("Error while decoding token", e);
    throw e;
  }
}

/**
 * Returns a list of proofs from a decoded token
 */
function getProofs(decoded_token: Token): WalletProof[] {
  if (!(decoded_token.proofs.length > 0)) {
    throw new Error("Token format wrong");
  }
  const proofs = decoded_token.proofs.flat();
  return useProofsStore().proofsToWalletProofs(proofs);
}

function getMint(decoded_token: Token) {
  /*
      Returns first mint of a token (very rough way).
      */
  if (decoded_token.proofs.length > 0) {
    return decoded_token.mint;
  } else {
    return "";
  }
}

function getUnit(decoded_token: Token) {
  if (decoded_token.unit != null) {
    return decoded_token.unit;
  } else {
    // search for unit in mints[...].keysets[...].unit
    const mintStore = useMintsStore();
    const mint = getMint(decoded_token);
    const keysets = mintStore.mints
      .filter((m) => m.url === mint)
      .flatMap((m) => m.keysets);
    if (keysets.length > 0) {
      return keysets[0].unit;
    }
    return "";
  }
}

function getMemo(decoded_token: Token) {
  if (decoded_token.memo != null) {
    return decoded_token.memo;
  } else {
    return "";
  }
}
