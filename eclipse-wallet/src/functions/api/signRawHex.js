// Signs unsigned raw btc hex tx

import * as tinysecp from "tiny-secp256k1"
import { ECPairFactory } from "ecpair"
const ECPair = ECPairFactory(tinysecp)
import * as bitcoin from "bitcoinjs-lib"
import * as bitcoinV3 from "../lib/bitcoinjs-lib_v3"

export default async function signRawHex(privKey, hexData) {

    try {
        const NETWORK = bitcoinV3.networks.bitcoin

        const keyPair = ECPair.fromWIF(privKey, NETWORK);
    
        const tx = bitcoinV3.Transaction.fromHex(hexData);
        console.log(tx)
        const txb = bitcoinV3.TransactionBuilder.fromTransaction(tx, NETWORK);
    
        for (let i = 0; i < tx.ins.length; i++) {
            txb.sign(i, keyPair);
        }
        
        const signedTxHex = txb.build().toHex();
        // Broadcast this signed raw transaction
        console.log(signedTxHex)
    
        return {
            success: true,
            message: "Transaction signed",
            data: signedTxHex
        }
    } catch(e) {
        console.error(e)
        return {
            success: false,
            message: e,
            data: null
        }
    }

}