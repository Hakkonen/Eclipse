
export async function getGlobalData(address) {
    return new Promise(resolve => {
        chrome.storage.local.get(["btcPairs"], res => {
            resolve(res.btcPairs)
        })
    })
}

export async function getSeedFromLs() {
    return new Promise(resolve => {
        chrome.storage.local.get(["seed"], res => {
            resolve(res.seed)
        })
    })
}

export async function getWalletFromLs() {
    return new Promise(resolve => {
        chrome.storage.local.get(["wallet"], res => {
            resolve(res.wallet)
        })
    })
}

export async function getObjFromLs(obj) {
    return new Promise(resolve => {
        chrome.storage.local.get([obj], res => {
            resolve(res)
        })
    })
}