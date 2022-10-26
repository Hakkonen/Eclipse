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

export default async function enhancedSend(sendObj, netName="mainnet") {
    // Ingests pubkey, WIF, and tx object and broadcasts enhanced send
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

    // Funcs for data chunk
    const decToHex = (n, assetIdNum) => {

        let hexConverted = hexConverter.decToHex(assetIdNum.toString(), { prefix: false })
        // console.log(hexConverted)
        // console.log("")
        // console.log("BIGHEXNUM: " + hexConverted)

        while(hexConverted.length < n) {
            hexConverted = "0" + hexConverted
        }
        return hexConverted
    }

    // Create datachunk
    const header = "434e545250525459"   // CNTRPRTY
    const messageID = "02"              // Enhanced send
    const assetID = decToHex(16, sendObj.assetId) // n, asset_id
    const assetQTY = decToHex(16, sendObj.qty) // todo: clarify division
    // const divisible = sendObj.divisible ? divisible = "01" : divisible = "00"
    // const callable = "00"
    // Get pubkeyhash

    let pubKeyHashObj
    if ((sendObj.destination[0]).toString() == "1") {
        // If base58
        pubKeyHashObj = bitcoin.address.fromBase58Check(sendObj.destination).hash
    } else if ((sendObj.destination.slice(0,3)).toString() == "bc1") {
        // If bech32
        pubKeyHashObj = bitcoin.address.fromBech32(sendObj.destination).hash
    } else {
        return {
            success: false,
            error: "Invalid address"
        }
    }
    
    // If version is 0 then prepend "00" hex header, else pass through hash
    const pubKeyHash = parseInt(bitcoin.address.fromBase58Check(sendObj.destination).version) === 0 ? "00" + pubKeyHashObj.toString("hex") : pubKeyHashObj.toString("hex")
    // TODO: Check wtf versions do
    // 434e545250525459 02 0000000960e079ef 00000000017d7840 009421bb74c10e173b9a76adbb9e537d91a1e30677 

    // console.log("")
    // console.log("ADDRESS HASH: " + pubKeyHash)
    // console.log("")

    // Add memo
    const memo = Buffer.from(sendObj.memo).toString('hex')

    console.log("")
    console.log(header, messageID, assetID, assetQTY, pubKeyHash, memo)

    const xcpDataChunk = header + messageID + assetID + assetQTY + pubKeyHash + memo
    console.log("XCP DATA: " + xcpDataChunk)

    // Encode xcp data chunk with rc4
    const encodedData = xcp_rc4(firstUtxoKey, xcpDataChunk)

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
    console.log(psbt)
    console.log("Create op_return")

    // // Create op_return output
    const scriptString = "OP_RETURN " + encodedData
    console.log(scriptString)

    const ret = bitcoin.script.fromASM(scriptString)
    console.log("RET!!!")
    console.log(ret)

    const embed = bitcoin.payments.embed({data: [ret]})
    console.log(embed.output)

    console.log("BALANCE: " + (walletBallance - minerFee))

    psbt.addOutput({
        script: ret,
        value: 0
    })
    console.log("FEE: " + minerFee)
    psbt.addOutput({
        address: sendObj.pubKey,
        value: walletBallance - minerFee
    })

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

    // // const txId = await sendBlockCypher(hexTx, netName).then(res => {
    // //     console.log(res)
    // //     return res
    // // })
    // // console.log("Final")

    // // return txId
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
                tx: response.data.tx
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