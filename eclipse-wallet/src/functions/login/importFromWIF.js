// Ingests legacy memnonic and returns user login object

// Bitcoinjs imports
import * as bitcoinjs from "bitcoinjs-lib"
// import bitcoinMsg from "bitcoinjs-message"

// Bitcoinjs: Required for decoding XCP seed
import * as tinysecp from "tiny-secp256k1"
import BIP32Factory from "bip32"
// You must wrap a tiny-secp256k1 compatible implementation
// const bip32 = BIP32Factory(tinysecp)

// Bitcoinjs: ECPAIR requirements for signing message
import { ECPairFactory } from "ecpair"
const ECPair = ECPairFactory(tinysecp)

export default function(wif, n="mainnet") {

    try {
        let network
        if (n == "mainnet") {
            network = bitcoinjs.networks.mainnet
        } else if (n == "testnet") {
            network = bitcoinjs.networks.testnet
        }
    
        const keyPair = ECPair.fromWIF(wif, network)
        const address = bitcoinjs.payments.p2pkh({ pubkey: keyPair.publicKey, network: network }).address
        // const privateKeyDecoded = node.derivePath("m/0'/0/" + i).toWIF()
    
        const addressObj = {
            ECPair: keyPair,
            pubKey: address,
            privKey: wif
        }
        return addressObj
    } catch(e) {
        console.error(e)
        return {error: true, message: e.message}
    }

}