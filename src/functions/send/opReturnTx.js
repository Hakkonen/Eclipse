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

export default async function opReturnTx(sendObj, netName="mainnet") {
    // Ingests pubkey, WIF, and tx object and broadcasts enhanced send
    // sendObj:
    //  pubKey, privKey, fee, dataChunk

    let network = bitcoin.networks.mainnet // default to mainnet
    if (netName == "testnet") {
        network = bitcoin.networks.testnet
    }

    // Extract WIF from privKey
    const wif = importFromWIF(sendObj.privKey)

    // Init wallet var
    let walletBallance = 0

    // Miner fee
    let minerFee = 0
    // Convert to satoshis if BTC value is accidentally passed through
    if(parseInt(sendObj.fee) <= 0) {
        minerFee = parseInt(sendObj.fee * 100000000)
    } else {
        minerFee = parseInt(sendObj.fee)
    }

    // TODO: Add redundancy from blockstream
    let firstUtxoKey
    let rawUtxoList = []
    try {
        console.log("Getting utxos from blockcypher")
        await getUtxosBlockCypher(sendObj.pubKey, netName)
            .then(res => {
                firstUtxoKey = res.firstUtxoKey;
                rawUtxoList = res.rawUtxoList;
                console.log("First UTXO Key: " + firstUtxoKey)
            })
    } catch(e) {
        console.error(e)
        console.log("Getting utxos from blockstream")
        await getUtxosBlockStream(sendObj.pubKey, netName)
            .then(res => {
                firstUtxoKey = res.firstUtxoKey;
                rawUtxoList = res.rawUtxoList;
                console.log("First UTXO Key: " + firstUtxoKey)
            })
    }

    // Data chunk prefab

    // Encode xcp data chunk with rc4
    const encodedData = xcp_rc4(firstUtxoKey, sendObj.dataChunk)

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

    // const embed = bitcoin.payments.embed({data: [ret]})
    // console.log(embed.output)

    psbt.addOutput({
        script: ret,
        value: 0
    })
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
}

async function getUtxosBlockStream(address, network="mainnet") {

    let firstUtxoKey
    let rawUtxoList = []

    // Url for getting UTXOs
    // const cypherNetName = network == "mainnet" ? "main" : "test3"
    // https://blockstream.info/api/address/13iqEVbvk7Ykyxd8MRQETc5zAzZduQCNPF/txs
    const utxoUrl = "https://blockstream.info/api/address/" + address
    const utxoList = await axios.get(utxoUrl)
        .then(res => {return res.data})
    console.log(utxoList)

    // Get raw txs for utxo list
    const rawUrl = "https://blockstream.info/api/tx/"
    if(utxoList.length > 0) {
        firstUtxoKey = utxoList.txrefs[0].txid
        for(let utxo of utxoList) {
            console.log(utxo)
            const response = await fetch(rawUrl + utxo.txid + "hex")
            const result = await response.json()
    
            result.vout = utxo.vout
            result.value = utxo.value
            rawUtxoList.push(result)
        }
    } else {
        // // Get last from mempool
        // firstUtxoKey = utxoList.unconfirmed_txrefs[0].tx_hash
        // for(let utxo of utxoList.unconfirmed_txrefs) {
        //     console.log(utxo)
        //     const response = await fetch(rawUrl + utxo.tx_hash + "?includeHex=1")
        //     const result = await response.json()
    
        //     result.vout = utxo.tx_output_n
        //     result.value = utxo.value
        //     rawUtxoList.push(result)
        // }
        throw "Cannot find first utxo on blockstream"
    }

    return {
        firstUtxoKey: firstUtxoKey,
        rawUtxoList: rawUtxoList
    }

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