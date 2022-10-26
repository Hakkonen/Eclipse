import axios from 'axios'
import getAssetInfo from './getAssetInfo'

// Gets address assets
async function axiosCall(address, url, username, password) {

    const result = await axios.post(url, {
        "method": "get_dispensers",
            "params": {
                "filters": 
                    [
                        {"field": "source", "op": "==", "value": address},
                        {"field": "quantity", "op": ">", "value": "0"}
                    ],
                "filterop": "AND"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
    }})
    console.log(result)
    return result.data.result
}

export default async function getDispensers(address="", network="mainnet") {

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
            result = await axiosCall(address, counterpartyAPI.url, counterpartyAPI.username, counterpartyAPI.password)
        } catch(e) {
            result = await axiosCall(address, cdaddyAPI.url, cdaddyAPI.username, cdaddyAPI.password)
        }
    }

    // Timer
    let end = Date.now()
    // console.log(`Asset get time: ${(end - start) / 1000}s`)

    return result

}