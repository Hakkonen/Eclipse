import axios from 'axios'

// Gets address assets
async function axiosCall(assets, url, username, password) {

    const result = await axios.post(url, {
        "method": "get_running_info",
            "params": {
                
            },
                "jsonrpc": "2.0",
                "id": 0
            },
        { auth: {
            username: username,
            password: password
    }})
    console.log(result)
    if(result.data.result.last_block !== null) {
        console.log("Current block: ", result.data.result.last_block.block_index)
    } else {
        console.log("Ping failed!")
        console.log(result)
    }
    
    return result.data.result
}

export default async function ping(assets, network="mainnet") {

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
    // TODO: Resolve block_index returning "null"
    if (network === "mainnet") {
        try {
            result = await axiosCall(assets, counterpartyAPI.url, counterpartyAPI.username, counterpartyAPI.password)
            console.log(result)

            // if (typeof result.data.result.last_block.block_index == "undefined") {
            //     console.log("Undefined, trying cdaddy")
            //     result = await axiosCall(assets, cdaddyAPI.url, cdaddyAPI.username, cdaddyAPI.password)
            // }
        } catch(e) {
            // result = await axiosCall(assets, cdaddyAPI.url, cdaddyAPI.username, cdaddyAPI.password)
            if (result.data.result.last_block !== null) {
                console.log("Calling ping again")
                setTimeout(function() { ping(); }, 5000);
            }
        }
    }

    // Timer
    let end = Date.now()
    // console.log(`Asset get time: ${(end - start) / 1000}s`)

    return result
}