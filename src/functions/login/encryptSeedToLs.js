// Encrypts seed and wallet

// Imports
import AES from 'crypto-js/aes'

export default function(wallet, seed, password) {    

    // Encrypt wallet
    const encryptedWallet = AES.encrypt(JSON.stringify(wallet), password).toString()

    chrome.storage.local.set({wallet: encryptedWallet})

    // Encrypt Seed
    const encryptedSeed = AES.encrypt(JSON.stringify(seed), password).toString()
    chrome.storage.local.set({seed: encryptedSeed})

}