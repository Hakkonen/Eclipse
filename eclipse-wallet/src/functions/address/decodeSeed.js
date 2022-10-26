// Takes in secret, gets seed from LS and returns seed
import encUTF8 from 'crypto-js/enc-utf8'
import AES from 'crypto-js/aes'

async function getSeedFromLs() {
    return new Promise(resolve => {
        chrome.storage.local.get(["seed"], res => {
            resolve(res.seed)
        })
    })
}

export default async function decodeSeed(secret) {

        const encSeed = await getSeedFromLs()

        return JSON.parse(AES.decrypt(encSeed, secret).toString(encUTF8))

}