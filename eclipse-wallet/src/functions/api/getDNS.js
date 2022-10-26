import axios from 'axios'
import getAssetInfo from './getAssetInfo'

// Gets address assets
async function axiosCall(assets, url, username, password) {

    const result = await axios.post(url, {
        "method": "get_asset_info",
            "params": 
                {"assets": assets}
            ,
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
    }})

    return result.data.result
}

export default async function getAssetInfo(assets, network="mainnet") {

    // Time loads
    let start = Date.now()

    // URLS
    const counterpartyAPI = {
        url: "http://api.counterparty.io:4000/api/",
        username: "rpc",
        password: "rpc"
    }
    const cdaddyAPI = {
        url: "https://public.coindaddy.io:4001/api/",
        username: "rpc",
        password: "1234"
    }

    let result
    if (network === "mainnet") {
        try {
            result = await axiosCall(assets, counterpartyAPI.url, counterpartyAPI.username, counterpartyAPI.password)
        } catch(e) {
            result = await axiosCall(assets, cdaddyAPI.url, cdaddyAPI.username, cdaddyAPI.password)
        }
    }

    // Timer
    let end = Date.now()
    // console.log(`Asset get time: ${(end - start) / 1000}s`)

    return result

}