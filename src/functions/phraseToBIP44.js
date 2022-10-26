export default function phraseToBIP44(phrase, i=0) {
    
    const bip39 = require('bip39')
    const bitcoin = require("bitcoinjs-lib")
    const bip32 = require('bip32')

    function getAddress (node, network) {
        return bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address
    }

    const seed = bip39.mnemonicToSeedSync(phrase)
    console.log(seed)
    
    const node = bip32.fromSeed(seed, bitcoin.networks.bitcoin)
    // console.log(node.toBase58())

    const child1 = node.derivePath("m/44'/0'/0'/0/" + i)
    // console.log(child1)
    // console.log(getAddress(child1))

    return getAddress(child1, bitcoin.networks.bitcoin )
}