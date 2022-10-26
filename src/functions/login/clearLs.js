// Clears all LS

export default function() {
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError
        if (error) {
            console.error(error)
        }
    })
    chrome.storage.sync.clear() 
}
