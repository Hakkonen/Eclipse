// Ingests XCP wordlist and returns bitcoin wallet node, using bitcoinjs
// This specific function returns the CHILD of the node, not the root itself

const Mnemonic = require("../Mnemonic")

// Bitcoinjs imports
import * as bitcoinjs from "bitcoinjs-lib"
import bitcoinMsg from "bitcoinjs-message"

// Bitcoinjs: Required for decoding XCP seed
import * as tinysecp from "tiny-secp256k1"
import BIP32Factory from "bip32"
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(tinysecp)
// const bip39 = require('bip39')

// Bitcoinjs: ECPAIR requirements for signing message
import { ECPairFactory } from "ecpair"
import crypto from "crypto"
const ECPair = ECPairFactory(tinysecp);

export default function createKeyPair(node, i=0, network=bitcoinjs.networks.bitcoin) {

    // Returns P2PKH wallet format
    function getAddress (node, network) {
        // TODO: Look into docs to see how to return privkey
        return bitcoinjs.payments.p2pkh({ pubkey: node.publicKey, network }).address
    }

    // Gets public key from HD key iteration
    // INFO: 
    // A hardened node is a derived path synctactically declared as such: m/n/n/n,
    // for bip32 specfiically (and xcp) we use "m/0'/0/n", where n is the root node n numbers derived 
    // from the parent seed. In this way we are able to generate essentially unlimited addresses from
    // one master seed.
    const child = node.derivePath("m/0'/0/" + i)
    // console.log(child1)
    const publicKeyDecoded = getAddress(child, network)
    // console.log(publicKeyDecoded)

    // Gets private key from HD key iteration
    // INFO:
    // node.derivePath returns and object with buffers of the keypair, the method .toWIF()
    // converts the keyPair's seed into a WIF (wallet import format), also known as a private Key
    // this is a base58 conversion of the buffer private key. Further information such as the pubKey
    // can be derived from the privKey.
    // console.log(node.derivePath("m/0'/0/" + i))
    const privateKeyDecoded = node.derivePath("m/0'/0/" + i).toWIF()

    // Returns { keyPair }
    // INFO:
    // node: is the HDnode, it is an object that contains seed information such as network private and public seed under node.network.bip32, this node therefor can perform all functions of a bitcoin wallet, however the follwing are included with the parent object in base58 string for sake of ease:
    //    privKey: this node's privKey in WIF, this is this bip32 address' seed
    //    pubKey: this node's pubKey in p2pkh, this is the public facing address for the node
    //      note: the pubKey is used in conjunction with a signed message, and message to prove
    //      a valid signature
    return {
        childNode: child,
        privKey: privateKeyDecoded,
        pubKey: publicKeyDecoded
    }

    // Reference: second input allows network selection such as testnet
    // return getAddress(child1, bitcoinjs.networks.bitcoin)
}