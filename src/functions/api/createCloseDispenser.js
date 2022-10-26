import axios from 'axios'

// Gets address assets
async function axiosCall(owner, assetName, fee, url, username, password) {

    const result = await axios.post(url, {
        "method": "create_dispenser",
            "params": {
                "source": owner,
                "asset": assetName,
                "give_quantity": 1,
                "escrow_quantity": 1,
                "mainchainrate": 1,
                "status": parseInt(10),
                "fee": parseInt(fee),
                "allow_unconfirmed_inputs": true
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
    }})
    console.log(result)

    return result.data
}

export default async function createCloseDispenser(owner, assetName, fee, network="mainnet") {

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

        console.log("trying cparty")
        result = await axiosCall(owner, assetName, fee, counterpartyAPI.url, counterpartyAPI.username, counterpartyAPI.password)
    
        if(result.hasOwnProperty("error")) {
            console.error("Error")
            let message = ""
            if(result.error.hasOwnProperty("data")) {
                message = result.error.data.message
            } else {
                message = result.error.message
            }
            
            console.log("message")
            return {
                success: false,
                message: "Error: " + message,
                data: null
            }
        } else {
            return {
                success: true,
                message: "Hex data generated",
                data: result.result
            }
        }

    }

    return result
}