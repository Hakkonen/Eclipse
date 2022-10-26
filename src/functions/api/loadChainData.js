// Compiles onchain data from various sources into object for app

// Network
import axios from "axios"

// Functions
import getBalances from "./getBalances"
import getBalanceHistory from "./getBalanceHistory"
import getAssetInfo from "./getAssetInfo"
import ping from "./ping"
import { getAddrBal, setAddrBal, setAddrHistory } from "../address/setLS"

async function getLsBalance(address) {
    return new Promise(resolve => {
        chrome.storage.local.get(["addressBalance"], res => {
            resolve(res.addressBalance)
        })
    })
}

export default async function loadChainData(address, currentHeight=0, network="mainnet") {

    // Get local storage
    const lsBalance = await getLsBalance(address)

    // Init vars for LS
    // let history = []
    // let assetBalance = []
    let searchXcpBalance = true 

    // // If LS is same address and recent then return LS data and skip GET
    // if (lsBalance != null && "address" in lsBalance && address === lsBalance.address && (Date.now() - lsBalance.time) < ttl) {
    //     history = lsBalance.history
    //     assetBalance = lsBalance.balance
    // } else {
    //     searchXcpBalance = true
    // } // Limits API calls to 1 minute at minimum by default

    // Ping for blocl height
    let blockHeight
    try {
        blockHeight = await ping()
        .then(res => {
            return res.last_block.block_index
        })
    } catch (e) {
        console.error(e)
        blockHeight = await ping()
        .then(res => {
            if(typeof res.last_block.block_index != "undefined")
            return res.last_block.block_index
        })
    }

    // ...get btc rate
    const btcPriceUrl = "https://api.coindesk.com/v1/bpi/currentprice.json"
    const btcUSD = await axios.get(btcPriceUrl).then((response) => {
        return response.data.bpi.USD.rate_float
    })

    // ...get btc balance & btc tx list
    // TODO: Add fallback

    let btcInfo = { finalBalance: 0, outputs: [] }
    
    // Get btc tx info and merge into standardised format
    // { finalBalance(int), outputs: [ { hash, address, sats(int), confirmed(date) } ] }
    try {
        // BlockCypher
        console.log("Reading txs from BlockCypher")
        await axios.get("https://api.blockcypher.com/v1/btc/" + (network == "mainnet" ? "main" : "testnet3") + "/addrs/" + address + "/full?limit=25")
        .then(res => {
            // Set final balance
            console.log("RESULT:")
            console.log(res.data)
            btcInfo.finalBalance = res.data.final_balance
            // parse tx's
            for(const tx of res.data.txs) {
                // // Parse outputs
                // let outputs = []
                // for (const output of tx) {
                //     let newOutput = {
                //         hash: tx.hash,
                //         address: output.addresses[0],
                //         value: output.value,
                //         confirmed: tx.confirmed
                //     }
                //     outputs.push(newOutput)
                // }

                // Compile UTXO
                // For single add sends
                if (tx.addresses.length == 2) {
                    let newUTXO = {
                        hash: tx.hash,
                        address: tx.outputs[0].addresses[0],
                        value: tx.outputs[0].value,
                        blockIndex: tx.block_height,
                        confirmed: tx.confirmed
                    }
                    btcInfo.outputs.push(newUTXO)
                }
            }
        })
    } 
    catch {
        // BlockStream
        console.log("Reading txs from BlockStream")

        await axios.get("https://blockstream.info/" + (network == "mainnet" ? "" : "testnet/") + "api/address/" + address)
            .then(res => {
                console.log(res.data)
                // Get final balance
                // btcInfo.final_balance = (parseInt(res.data.chain_stats.funded_txo_sum) - parseInt(res.data.chain_stats.spent_txo_sum)) / 100000000

                // Get final bal
                btcInfo.finalBalance = (parseInt(res.data.chain_stats.funded_txo_sum) - parseInt(res.data.chain_stats.spent_txo_sum))
            })
        await axios.get("https://blockstream.info/" + (network == "mainnet" ? "" : "testnet/") + "api/address/" + address + "/txs")
            .then(res => {
                // get outputs
                for(const tx of res.data) {
                    // Compile UTXO
                    // For single add sends
                    if (tx.vout.length == 2 && tx.vout[0].scriptpubkey_type == "p2pkh") {
                        const date = tx.status.block_time.toLocaleString("en-GB")
                        let newUTXO = {
                            hash: tx.txid,
                            address: tx.vout[0].scriptpubkey_address,
                            value: tx.vout[0].value,
                            blockIndex: tx.status.block_height,
                            confirmed: date
                        }
                        btcInfo.outputs.push(newUTXO)
                    }
                }
            })
    } 
    // finally {
    //     // SoChain
    //     console.log("Reading txs from SoChain")
    //     const sochainRes = await axios.get("https://chain.so/api/v2/get_address_balance/" + (network == "mainnet" ? "BTC" : "BTCTEST") + "/" + address)
    //     .then(res => {
    //         console.log(res.data)
    //         return res.data
    //     })
    // }

    const btcAsset = {
        address: address,
        asset: "BTC",
        asset_longname: null,
        description: "Digital cryptocurrency",
        detailed: true,
        divisible: true,
        issuer: null,
        locked: false,
        logo: "",
        quantity: btcInfo.finalBalance,
        supply: 18925000,
        asset: "BTC",
        assetID: 0
    }

    // Update history and balance if GET is true
    if (searchXcpBalance) {

        async function getData(address) {
            // ...get xcp balance history
            const xcpHistory = await getBalanceHistory(address).then(res => {
                return res
            })

            // ...get address asset balance
            const assetBalance = await getBalances(address).then(res => {
                // Shifts XCP to start of list for ease of access
                
                let returnList = []
                for (const asset of res) {
                    // Hardcodes XCP as divisible due to an API call returning non-div, wtf y?
                    if(asset.asset === "XCP") {
                        asset.detailed = false
                        asset.divisible = true
                        returnList.unshift(asset)
                    } else {
                        asset.detailed = false
                        returnList.push(asset)
                    }
                }

                return returnList
            })
            
            // Get asset info for balances and history
            let nameList = []
            for(const asset of assetBalance) {
                // Update only un-detailed assets
                if(asset.detailed == false) {
                    nameList.push(asset.asset)
                }
            }

            for(const tx of xcpHistory) {
                // Update only un-detailed assets
                if(tx.type == "credit" || tx.type == "debit" || tx.type == "issuance" && tx.detailed == "false") {
                    nameList.push(tx.asset)
                }
            }
            const uniqNames = [...new Set(nameList)]

            // Fetch asset info
            const assetInfo = await getAssetInfo(uniqNames)
                .then(res => {
                    return res
                })

            // Merge asset info with balance and history lists

            for (let asset of assetBalance) {
                // Find matching asset
                for (const detailedAsset of assetInfo) {
                    if (asset.asset == detailedAsset.asset) {
                        asset.detailed = true
                        asset.asset_longname = detailedAsset.asset_longname
                        asset.description = detailedAsset.description
                        asset.locked = detailedAsset.locked
                        asset.issuer = detailedAsset.issuer
                        asset.supply = detailedAsset.supply
                        break
                    }
                }
            }

            // Sort asset balance
            assetBalance.sort((a, b) => {
                let nameA = a.asset.toUpperCase() // ignore upper and lowercase
                if (a.asset_longname != null) {nameA = a.asset_longname.toUpperCase()}
                let nameB = b.asset.toUpperCase() // ignore upper and lowercase
                if (b.asset_longname != null) {nameB = b.asset_longname.toUpperCase()}

                if(nameB === "XCP") {
                    // Keeps XCP at top for ease of use
                    return 1
                } else {
                    if (nameA < nameB) {
                        return -1
                    }
                    if (nameA > nameB) {
                        return 1
                    }
                }

                // names must be equal
                return 0
            })

            for (let tx of xcpHistory) {
                if(tx.type == "credit" || tx.type == "debit" || tx.type == "issuance") {

                    // Find matching asset
                    for (const detailedAsset of assetInfo) {
                        if (tx.asset == detailedAsset.asset) {
                            tx.detailed = true
                            tx.asset_longname = detailedAsset.asset_longname
                            tx.description = detailedAsset.description
                            tx.locked = detailedAsset.locked
                            tx.divisible = detailedAsset.divisible
                            tx.issuer = detailedAsset.issuer
                            tx.supply = detailedAsset.supply
                            break
                        }
                    }
                }
            }

            // Merge btc tx history and xcp tx history
            let history = []
            for (const tx of xcpHistory) {
                tx.blockIndex = tx.block_index
                history.push(tx)
            }
            for (const tx of btcInfo.outputs) {
                tx.type = "btcTx"
                history.push(tx)
            }
            history.sort((a, b) => b.blockIndex - a.blockIndex)

            // Add btc asset
            let btcIncluded = false
            for(const asset of assetBalance) {
                if (asset.asset == "BTC") {
                    btcIncluded = true
                }
            }
            if (!btcIncluded) {
                assetBalance.unshift(btcAsset)
            }
            
            return {
                history: history,
                assetBalance: assetBalance
            }
        }
        const data = await getData(address)

        // Set to LS
        setAddrBal(address, data.assetBalance, data.history)

        const walletBalance = {
            btcUSD: btcUSD,
            btcBalance: btcInfo.finalBalance,
            history: data.history,
            assetBalance: data.assetBalance,
            blockHeight: blockHeight
        }
        
        // Return fresh data
        return walletBalance

    } 

}