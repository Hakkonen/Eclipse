// Encrypts seed and wallet

// Imports
import AES from 'crypto-js/aes'

export default function(wallet, password) {    

    // Encrypt wallet
    const encryptedWallet = AES.encrypt(JSON.stringify(wallet), password).toString()

    chrome.storage.local.set({wallet: encryptedWallet})

}