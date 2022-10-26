// Ingests passphrase and converts to keypair
export default function phraseToBIP32(stdin, i=0) {
    const bip39 = require('bip39')
    const bitcore = require("bitcore-lib")

    // Convert Mnemonic to bip39 seed
    const seed = bip39.mnemonicToSeedSync(stdin)

    // Hierarchical Deterministic key deriv
    const HDkey = bitcore.HDPrivateKey.fromSeed(seed, bitcore.Networks["mainnet"])
    const KeyDerivition = HDkey.derive("m/0'/0/" + i)

    // Gets pubKey
    const publicKey = bitcore.Address(KeyDerivition.publicKey, bitcore.Networks["mainnet"]).toString()
    // console.log(publicKey)

    // PrivKey
    const privateKey = bitcore.PrivateKey(KeyDerivition.privateKey).toWIF()
    // console.log(privateKey)

    const wallet = {
        pubKey: publicKey,
        privKey: privateKey
    }

    return wallet
}
