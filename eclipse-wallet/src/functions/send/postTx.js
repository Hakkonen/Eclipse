// Node fetch
import axios from 'axios'

export default async function postTx(hexTx, netName) {
    const endpoints = [ "blockstream", "blockcypher", "sochain" ]

    let result = {}
    for(const endpoint of endpoints) {
        console.log(endpoint)
        if(endpoint == "sochain") {
            const txRes = await sendSoChain(hexTx, netName).then(res => {
                console.log(res)
                return res
            })
            if (txRes.success) {
                result = txRes
                break
            }
        } else if (endpoint == "blockstream") {
            const txRes = await sendBlockstream(hexTx, netName).then(res => {
                console.log(res)
                return res
            })
            if (txRes.success) {
                result = txRes
                break
            }
        } else if (endpoint == "blockcypher") {
            const txRes = await sendBlockCypher(hexTx, netName).then(res => {
                console.log(res)
                return res
            })
            if (txRes.success) {
                result = txRes
                break
            } else {
                result = txRes
            }
        }
    }
    
    return result
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