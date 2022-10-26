// Ingests legacy memnonic and returns user login object

// Functional imports
import axios from "axios"

// Mnemonic for legacy wordlist
import Mnemonic from "../Mnemonic"

// Bitcoinjs imports
import * as bitcoinjs from "bitcoinjs-lib"
// import bitcoinMsg from "bitcoinjs-message"

// Bitcoinjs: Required for decoding XCP seed
import * as tinysecp from "tiny-secp256k1"
import BIP32Factory from "bip32"
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(tinysecp)

// node encryption
import encUTF8 from 'crypto-js/enc-utf8'
import AES from 'crypto-js/aes'
import ls from 'localstorage-slim'

// Bitcoinjs: ECPAIR requirements for signing message
// import { ECPairFactory } from "ecpair"
// import crypto from "crypto"
// const ECPair = ECPairFactory(tinysecp);

export default function loginLegacy(mnemonic, network) {

    // Networks
    const mainnet = bitcoinjs.networks.bitcoin
    const testnet = bitcoinjs.networks.testnet
    
    // Converts seed phrase to byte array for bip32 func
    let passphrase_array = mnemonic.split(" ")
    let mnemonicHex = Mnemonic.fromWords(passphrase_array).toHex()
    const buffedSeed = Buffer.from(mnemonicHex, "hex")

    // Ingests byte array and encodes into bip32 format keypair
    const node = bip32.fromSeed(buffedSeed, network === "mainnet" ? mainnet : testnet)

    return node
}