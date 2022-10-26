import axios from 'axios'

// Gets address assets
async function axiosCall(address, url, username, password) {

    // Init return array
    let historyData = []

    // const result = await axios.post(url, {
    //     "method": "get_transactions",
    //         "params": {
    //             "filters": [
    //                 {"field": "source", "op": "==", "value": address},
    //                 {"field": "destination", "op": "==", "value": address}
    //             ],
    //             "filterop": "OR",
    //             "limit": 25,
    //             "order_by": "tx_index",
    //             "order_dir": "DESC"
    //         },
    //         "jsonrpc": "2.0",
    //         "id": 0
    //     },
    //     { auth: {
    //         username: username,
    //         password: password
    //     }}
    // )

    // const sends = await axios.post(url, {
    //     "method": "get_sends",
    //         "params": {
    //             "filters": [
    //                 {"field": "source", "op": "==", "value": address},
    //                 {"field": "destination", "op": "==", "value": address}
    //             ],
    //             "filterop": "OR",
    //             "limit": 25,
    //             "order_by": "tx_index",
    //             "order_dir": "DESC"
    //         },
    //         "jsonrpc": "2.0",
    //         "id": 0
    //     },
    //     { auth: {
    //         username: username,
    //         password: password
    //     }}
    // )

    // // Format sends and add to list
    // for (let tx of sends.data.result) {
    //     // Determine if send or receive
    //     if (tx.source == address) {
    //         tx.type = "send"
    //     } else {
    //         tx.type = "receive"
    //     }
        
    //     historyData.push(tx)
    // }

    const issuances = await axios.post(url, {
        "method": "get_issuances",
            "params": {
                "filters": [
                    {"field": "source", "op": "==", "value": address}
                ],
                "limit": 25,
                "order_by": "tx_index",
                "order_dir": "DESC"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
        }}
    )

    // Format issuance and add to list
    for (let tx of issuances.data.result) {
        tx.type = "issuance"
        historyData.push(tx)
    }

    const destructions = await axios.post(url, {
        "method": "get_destructions",
            "params": {
                "filters": [
                    {"field": "source", "op": "==", "value": address}
                ],
                "limit": 25,
                "order_by": "tx_index",
                "order_dir": "DESC"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
        }}
    )

    // Format destruct and add to list
    for (let tx of destructions.data.result) {
        tx.type = "destruction"
        historyData.push(tx)
    }

    const broadcasts = await axios.post(url, {
        "method": "get_broadcasts",
            "params": {
                "filters": [
                    {"field": "source", "op": "==", "value": address}
                ],
                "limit": 25,
                "order_by": "tx_index",
                "order_dir": "DESC"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
        }}
    )

    // Format broadcasts and add to list
    for (let tx of broadcasts.data.result) {
        tx.type = "broadcast"
        historyData.push(tx)
    }

    const burns = await axios.post(url, {
        "method": "get_burns",
            "params": {
                "filters": [
                    {"field": "source", "op": "==", "value": address}
                ],
                "limit": 25,
                "order_by": "tx_index",
                "order_dir": "DESC"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
        }}
    )

    // Format burns and add to list
    for (let tx of burns.data.result) {
        tx.type = "burn"
        historyData.push(tx)
    }

    const dispensers = await axios.post(url, {
        "method": "get_dispensers",
            "params": {
                "filters": [
                    {"field": "source", "op": "==", "value": address}
                ],
                "limit": 25,
                "order_by": "tx_index",
                "order_dir": "DESC"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
        }}
    )

    // Format dispensers and add to list
    for (let tx of dispensers.data.result) {
        tx.type = "dispenser"
        historyData.push(tx)
    }

    const debits = await axios.post(url, {
        "method": "get_debits",
            "params": {
                "filters": [
                    {"field": "address", "op": "==", "value": address}
                ],
                "limit": 25,
                "order_by": "block_index",
                "order_dir": "DESC"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
        }}
    )

    // Format debits and add to list
    for (let tx of debits.data.result) {
        tx.type = "debit"
        historyData.push(tx)
    }

    const credits = await axios.post(url, {
        "method": "get_credits",
            "params": {
                "filters": [
                    {"field": "address", "op": "==", "value": address}
                ],
                "limit": 25,
                "order_by": "block_index",
                "order_dir": "DESC"
            },
            "jsonrpc": "2.0",
            "id": 0
        },
        { auth: {
            username: username,
            password: password
        }}
    )

    // Format credits and add to list
    for (let tx of credits.data.result) {
        tx.type = "credit"
        historyData.push(tx)
    }

    return historyData
}

// async function axiosCall(address, url, username, password) {
//     const result = await axios.post(url, {
//         "method": "get_balance_history",
//             "params": {
//                 "asset": "QUESTFREN",
//                 "addresses": address,
//             },
//             "jsonrpc": "2.0",
//             "id": 0
//         },
//         { auth: {
//             // username: username,
//             // password: password
//         }}
//     )

//     return result.data
// }

export default async function getBalances(address, network="mainnet") {

    // // Time loads
    // let start = Date.now()

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

    // // Timer
    // let end = Date.now()
    // console.log(`Asset get time: ${(end - start) / 1000}s`)

    return result
}