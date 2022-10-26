import Mnemonic from "./Mnemonic"

// Ingests a counterwallet passphrase and returns a public/private keypair
export default function phraseToXCP(passphrase, i=0) {
    // Bitcoin imports
    const bitcore = require("bitcore-lib")

    // Defines network for bitcore funcs
    const network = bitcore.Networks["mainnet"]

    // Pre BIP32 Wordlist method
    // Converts passphrase to seed
    const seed = Mnemonic.fromWords(passphrase.trim().split(" ")).toHex()
    // alert(seed)
    
    // Converts seed to HD
    const HDkey = bitcore.HDPrivateKey.fromSeed(seed, network)
    // console.log(HDkey.xprivkey)
    
    // Gets key derivation, "i" iterates next address in key tree
    const KeyDerivition = HDkey.derive("m/0'/0/" + i)
    // alert(KeyDerivition)

    // Gets pubKey
    const publicKey = bitcore.Address(KeyDerivition.publicKey, network).toString()

    // Gets privKey
    const privateKey = bitcore.PrivateKey(KeyDerivition.privateKey).toWIF()
    // alert(privateKey)

    const wallet = {
        pubKey: publicKey,
        privKey: privateKey
    }

    return wallet
}