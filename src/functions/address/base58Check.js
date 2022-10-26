// Bitcoinjs imports
import bs58check from "bs58check"

// Checks if address is valid base58
export default function(address) {

        const decoded = bs58check.decode(address)
        // return bs58check.encode(decoded)
        // try {
        //     return bs58check.encode(decoded)
        // } catch(e) {
        //     return false
        // }

        if(bs58check.encode(decoded) == address) {
            return true
        } else {
            return false
        }
}