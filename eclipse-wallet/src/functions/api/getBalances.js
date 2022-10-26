import axios from 'axios'

// Gets address assets
async function axiosCall(address, url, username, password) {

    const result = await axios.post(url, {
        "method": "get_balances",
            "params": {
                "filters": 
                    [
                        {"field": "address", "op": "==", "value": address},
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

export default async function getBalances(address, network="mainnet") {

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
            result = await axiosCall(address, counterpartyAPI.url, counterpartyAPI.username, counterpartyAPI.password)
        } catch(e) {
            result = await axiosCall(address, cdaddyAPI.url, cdaddyAPI.username, cdaddyAPI.password)
        }
    }

    return result
}