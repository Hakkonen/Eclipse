// Gets and sets address balance to LS with TTL

export async function getAddrBal(address, ttl=600000) {
    // Ensure pubkey matches, else return false
    const lsBalance = await chrome.storage.local.get(["addressBalance"], (result) => {
        return result.addressBalance.balance
    })

    // console.log("TTL Counter: " + (Date.now() - lsBalance.addressBalance.time) / 1000)
    // console.log(lsBalance.addressBalance)

    return lsBalance

}

export function setAddrBal(address, balance, history) {

    const addressBalance = {
        address: address,
        balance: balance,
        history: history,
        time: Date.now()
    }

    chrome.storage.local.set({addressBalance: addressBalance})
}

export function setAddrHistory(history) {
    const addressHistory = {
        history: history,
        time: Date.now()
    }

    chrome.storage.local.set({addressHistory: addressHistory})
}

export function setGlobalData(btcPairs) {

    chrome.storage.local.set({btcPairs: btcPairs})
    
}

export function setSettingsLs(setObject) {
    chrome.storage.local.set({settings: setObject})
}