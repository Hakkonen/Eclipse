// Imports
import ls from 'localstorage-slim'
import encUTF8 from 'crypto-js/enc-utf8'
import AES from 'crypto-js/aes'

// Ingests mnemonic phrase and password, encrypts into local storage for use
export default function(pubKeyRaw, privKeyRaw, password, ttl=null) {

    // Global encryption
    ls.config.encrypt = true

    // Update encrypter to use AES encryption
    ls.config.encrypter = (data, secret) => AES.encrypt(JSON.stringify(data), secret).toString()

    // Update decrypter to decrypt AES-encrypted data
    ls.config.decrypter = (data, secret) => {
        try {
            return JSON.parse(AES.decrypt(data, secret).toString(encUTF8))
        } catch (e) {
            // incorrect/missing secret, return the encrypted data instead
            return data
        }
    }

    // // Create array to store keys
    // let keyChain = new Array()

    // Create keypair object
    const wallet = {
        pubKey: pubKeyRaw,
        privKey: privKeyRaw
    }

    // // Append wallet to keychain
    // keyChain.push(wallet)

    // Encrypt LS data with AES and TTL expiry set to 1 hour
    
    ls.set("pubKey", wallet.pubKey, { ttl: ttl, encrypt: false })
    ls.set("privKey", wallet.privKey, { ttl: ttl, secret: password })

    // // Test decrypt
    console.log(ls.get("wallet_1", { secret: password }))

}