// Decrypts seed

import encUTF8 from 'crypto-js/enc-utf8'
import AES from 'crypto-js/aes'

// Ingests encrypted string and pword and returns wallet object
export default function(encryptedString, password) {

    let wallet = {}
    
    try {
        wallet = JSON.parse(AES.decrypt(encryptedString, password).toString(encUTF8))
    } catch(e) {
        return false
    }

    return wallet
}