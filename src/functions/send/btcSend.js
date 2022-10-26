// Node fetch
import axios from 'axios'

// Post func
import postTx from './postTx'

// Bitcoin: ECPAIR requirements for signing message
// import { ECPairFactory } from 'ecpair'
import crypto from "crypto"
import * as tinysecp from "tiny-secp256k1"
import { ECPairFactory } from "ecpair"
const ECPair = ECPairFactory(tinysecp)
import * as bitcoin from "bitcoinjs-lib"

import hexConverter from "hex2dec"
import { xcp_rc4 } from "../rc4"
import importFromWIF from '../login/importFromWIF'

// Validator
const validator = (
    pubkey,
    msghash,
    signature,
) => ECPair.fromPublicKey(pubkey).verify(msghash, signature)

export default async function btcSend(sendObj, netName="mainnet") {
        // Ingests pubkey, WIF, and tx object and broadcasts btc send
        console.log("START SEND")

        let network = bitcoin.networks.mainnet // default to mainnet
        if (netName == "testnet") {
            network = bitcoin.networks.testnet
        }
        console.log("NETWORK: " + netName)

        // Extract WIF from privKey
        const wif = importFromWIF(sendObj.privKey)

        // Init wallet var
        let walletBallance = 0

        // Miner fee
        const minerFee = sendObj.fee
        console.log("FEE: " + minerFee)

        let firstUtxoKey
        let rawUtxoList = []
        try {
            console.log("Getting utxos")
            await getUtxosBlockCypher(sendObj.pubKey, netName)
                .then(res => {
                    firstUtxoKey = res.firstUtxoKey;
                    rawUtxoList = res.rawUtxoList;
                })
        } catch(e) {
            console.error(e)
        }
        console.log("After try catch")

        // 5. Sign input
        // Create PSBT
        const psbt = new bitcoin.Psbt({network})
        // Add inputs
        for(const utxo of rawUtxoList) {
            walletBallance += utxo.value
            psbt.addInput({
                hash: utxo.hash,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(utxo.hex, 'hex')
            })
        }
        console.log("WALLET BALANCE: " + walletBallance)

        // Create psbt outputs
        for(let output of sendObj.outputs) {
            console.log("Output:")
            console.log(output)
            // Create output
            psbt.addOutput(output)
            console.log("Wallet bal: " + walletBallance)
            walletBallance -= output.value
            console.log("Wallet bal: " + walletBallance)
        }
        console.log(minerFee)
        // Add remaining btc return output
        psbt.addOutput({
            address: sendObj.pubKey,
            value: walletBallance - minerFee // CALCULATE REMAINING
        })
        // Check that balance is positive
        if(walletBallance < 0) {
            return {
                success: false,
                error: "Insufficient balance"
            }
        }

        // Sign
        console.log("sign")
        psbt.signAllInputs(wif.ECPair)
        psbt.validateSignaturesOfAllInputs(validator)
        psbt.finalizeAllInputs()

        const hexTx = psbt.extractTransaction().toHex()
        console.log('Transaction hexadecimal:')
        console.log(hexTx)    

        // 6. Return hex data
        return {
            success: true,
            hex: hexTx,
            error: ""
        }

        // // 6. Broadcast to network
        // let result = {}
        // await postTx(hexTx, network).then(res => { result = res })

        // if (Object.keys(result).length == 0) {
        //     result.success = false
        //     result.error = "Transaction failed"
        // }
        // return result
}

async function sendSoChain(hexTx, network="mainnet") {
    // Chain.so
    // Note Requires object { "tx": "hex" }
    const cypherNetName = network == "mainnet" ? "BTC" : "BTCTEST"
    const pushUrl = "https://chain.so/api/v2/send_tx/" + cypherNetName
    const jsonRawTx = JSON.stringify({tx_hex: hexTx})
    console.log(jsonRawTx)

    const config = { headers: {'Content-Type': 'application/json'} }
    const tx = await axios.post(pushUrl, jsonRawTx, config)
        .then((response) => {
            //receive response
            console.log(response);
            // console.log(response.data.tx);
            return {
                success: true,
                tx: response.data.data.txid
            }
        })
        .catch(e => {
            return {
                success: false,
                error: e
            }
        })
    return tx
}

async function sendBlockCypher(hexTx, network="mainnet") {
    // Blockcypher
    // Note Requires object { "tx": "hex" }
    const cypherNetName = network == "mainnet" ? "main" : "test3"
    const pushUrl = "https://api.blockcypher.com/v1/btc/" + cypherNetName + "/txs/push"
    const jsonRawTx = JSON.stringify({tx: hexTx})
    console.log(jsonRawTx)

    const tx = await axios.post(pushUrl, jsonRawTx)
        .then((response) => {
            //receive response
            console.log(response);
            console.log(response.data.tx);
            return {
                success: true,
                tx: response.data.tx.hash
            }
        })
        .catch(e => {
            return {
                success: false,
                error: e.response.data.error
            }
        })
    return tx
}

async function sendBlockstream(hexTx, network="mainnet") {
    // Blockstream
    // Note: Requires string of transaction hex
    const cypherNetName = network == "mainnet" ? "/" : "testnet/"
    const pushUrl = "https://blockstream.info/" + cypherNetName + "api/tx"

    const tx = await axios.post(pushUrl, hexTx)
        .then((response) => {
            //receive response
            console.log(response);
            // console.log(response.data.tx);
            return {
                success: true,
                tx: response.data
            }
        })
        .catch(e => {
            return {
                success: false,
                error: e.response.data
            }
        })
    return tx
}

async function getUtxosBlockCypher(address, network="mainnet") {

    let firstUtxoKey
    let rawUtxoList = []

    // Url for getting UTXOs
    const cypherNetName = network == "mainnet" ? "main" : "test3"
    const utxoUrl = "https://api.blockcypher.com/v1/btc/" + cypherNetName + "/addrs/" + address + "?unspentOnly=1&includeScript=1"
    const utxoList = await axios.get(utxoUrl)
        .then(res => {return res.data})
    console.log(utxoList)

    // Get raw txs for utxo list
    const rawUrl = "https://api.blockcypher.com/v1/btc/" + cypherNetName + "/txs/"
    if("txrefs" in utxoList) {
        firstUtxoKey = utxoList.txrefs[0].tx_hash
        for(let utxo of utxoList.txrefs) {
            console.log(utxo)
            const response = await fetch(rawUrl + utxo.tx_hash + "?includeHex=1")
            const result = await response.json()
    
            result.vout = utxo.tx_output_n
            result.value = utxo.value
            rawUtxoList.push(result)
        }
    } else {
        firstUtxoKey = utxoList.unconfirmed_txrefs[0].tx_hash
        for(let utxo of utxoList.unconfirmed_txrefs) {
            console.log(utxo)
            const response = await fetch(rawUrl + utxo.tx_hash + "?includeHex=1")
            const result = await response.json()
    
            result.vout = utxo.tx_output_n
            result.value = utxo.value
            rawUtxoList.push(result)
        }
    }

    return {
        firstUtxoKey: firstUtxoKey,
        rawUtxoList: rawUtxoList
    }

}