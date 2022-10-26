export default function checkWordlist(phrase, list) {
    const splitPhrase = phrase.split(" ")

    let matching = true

    // Check each word exists in wordlist
    splitPhrase.forEach(word => {
        if(list.includes(word) == false) {
            matching = false
        }
    })

    return matching
}