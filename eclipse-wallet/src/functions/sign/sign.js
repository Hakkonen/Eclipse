// Takes in keypair and string and signs

import bitcoinMessage from "bitcoinjs-message"
import * as tinysecp from "tiny-secp256k1"
import { ECPairFactory } from "ecpair"
const ECPair = ECPairFactory(tinysecp)

export default function Sign(message, privKey, n="mainnet") {

    let keyPair = ECPair.fromWIF(privKey)
    let privateKey = keyPair.privateKey

    let signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)
    console.log(signature.toString('base64'))

    // Verify
    // console.log(bitcoinMessage.verify(message, address, signature))

    return signature.toString('base64')
}