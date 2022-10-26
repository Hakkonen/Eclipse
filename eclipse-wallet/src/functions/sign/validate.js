// Takes in addy, signature and string and validates

import bitcoinMessage from "bitcoinjs-message"
import * as tinysecp from "tiny-secp256k1"
import { ECPairFactory } from "ecpair"
const ECPair = ECPairFactory(tinysecp)

export default function Validate(address, message, signature) {

    // Verify
    return bitcoinMessage.verify(message, address, signature)

}