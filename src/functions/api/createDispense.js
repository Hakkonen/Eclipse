import axios from 'axios'

// Gets address assets
async function axiosCall(owner, assetName, give_quantity, escrow_quantity, mainchainrate, open_address, status, fee, url, username, password) {

    const result = await axios.post(url, {
        "method": "create_dispenser",
            "params": {
                "source": owner,
                "asset": assetName,
                "give_quantity": parseInt(give_quantity),
                "escrow_quantity": parseInt(escrow_quantity),
                "mainchainrate": parseInt(mainchainrate),
                "open_address": open_address,
                "oracle_address": null,
                "status": parseInt(status),
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

export default async function createDispense(owner, assetName, give_quantity, escrow_quantity, mainchainrate, open_address, status, fee, network="mainnet") {

    console.log(owner, assetName, give_quantity, escrow_quantity, mainchainrate, open_address, status, fee)

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
        result = await axiosCall(owner, assetName, give_quantity, escrow_quantity, mainchainrate, open_address, status, fee, counterpartyAPI.url, counterpartyAPI.username, counterpartyAPI.password)
    
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