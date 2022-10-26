// Gets present asset state from server before sending

import axios from 'axios'

// Gets address assets
async function axiosCall(asset, url, username, password) {

    const result = await axios.post(url, {
        "method": "get_assets",
            "params": {
                "filters": 
                    [
                        {"field": "asset_name", "op": "==", "value": asset}
                    ],
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
    }})
    console.log(result.data.result)
    return result.data.result
}

export default async function getSendInfo(asset, network="mainnet") {

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
    // const cBlockurl = "https://public.coindaddy.io:4101/api/" 

    let result
    if (network === "mainnet") {
        try {
            result = await axiosCall(asset, counterpartyAPI.url, counterpartyAPI.username, counterpartyAPI.password)
        } catch(e) {
            result = await axiosCall(asset, cdaddyAPI.url, cdaddyAPI.username, cdaddyAPI.password)
        }
    }

    // Timer
    let end = Date.now()
    // console.log(`Asset get time: ${(end - start) / 1000}s`)

    return result
}