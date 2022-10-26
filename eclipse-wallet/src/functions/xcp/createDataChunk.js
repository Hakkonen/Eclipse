// Creates datachunks for XCP sends

// Imports
import * as bitcoin from "bitcoinjs-lib"
import hexConverter from "hex2dec"
import assetToID from "./assetToID"

export default function createDataChunk(dataObject) {

    // dataObject:
    // { mode: "eg: issuance", assetName: string, issanceQty: str, description: bool }

    // Message ID types
    const enhancedSend = "02"
    const issuance = "14"
    const dispenser = "13"

    // Datachunk values
    // ALL
    let header = "434e545250525459"     // prefix:      CNTRPRTY
    let messageID = ""                  // ID :         02 = enhanced send
    let assetID = ""                    // Asset ID:    0000000000000001 = 1 (Asset ID for XCP)

    // ENHANCED SEND
    if (dataObject.mode == "send") {

        // Create datachunk
        // Prefix: CNTRPRTY
        messageID = "02"
        // Get asset ID hex
        assetID = decToHex(16, assetToID(dataObject.assetName))
        // Get asset qty hex
        let assetQty = decToHex(16, dataObject.assetQty) // n < 18446744073709551615

        // Get pubkeyhash
        let pubKeyHashObj
        if ((dataObject.destination[0]).toString() == "1") {
            // If base58
            pubKeyHashObj = bitcoin.address.fromBase58Check(dataObject.destination).hash
        } else if ((dataObject.destination.slice(0,3)).toString() == "bc1") {
            // If bech32
            pubKeyHashObj = bitcoin.address.fromBech32(dataObject.destination).hash
        } else {
            return {
                success: false,
                error: "Invalid address"
            }
        }
        
        // If version is 0 then prepend "00" hex header, else pass through hash
        const pubKeyHash = parseInt(bitcoin.address.fromBase58Check(dataObject.destination).version) === 0 ? "00" + pubKeyHashObj.toString("hex") : pubKeyHashObj.toString("hex")
        // TODO: Check wtf versions do
        // 434e545250525459 02 0000000960e079ef 00000000017d7840 009421bb74c10e173b9a76adbb9e537d91a1e30677 

        // Add memo
        // TODO: Check limit
        const memo = Buffer.from(dataObject.memo).toString('hex')
        if (memo.length > 66) {
            throw "Memo string too long, limit: 33ch"
        }

        // console.log("")
        // console.log(header, messageID, assetID, assetQTY, pubKeyHash, memo)

        const xcpDataChunk = header + messageID + assetID + assetQty + pubKeyHash + memo
        console.log("XCP DATA: " + xcpDataChunk)

        console.log("XCP DATA: ")
        console.log(xcpDataChunk)
        console.log(xcpDataChunk.length)

        return xcpDataChunk

    }


    // ISSUANCE
    if (dataObject.mode == "issuance") {

        // ISSUANCE VARS                    Max datachunk length: 160
        // Prefix:                          434e545250525459
        // ID                               20 (00000014)
        // Asset ID                         0000000000000001 - 16 length
        let issuanceQty = ""                // Asset qty:   0000000000000000 = 0 (Quantity)
        let divisibility = "00"             // 00 = 0 (Divisibility, 1 = divisible)
        let callable = "00"                 // 00 = 0 (Callable, 0 = false)
        let callDate = "00000000"           // 00000000 = 0 (Call date)
        let callPrice = "00000000"          // 00000000 = 0 (Call price)
        let description = ""                // 044c4f434b = LOCK (To lock description)

        // Get asset ID
        // Limit of 13 chars
        // Prefix
        messageID = "00000014"
        assetID = decToHex(16, assetToID(dataObject.assetName))
        issuanceQty = decToHex(16, dataObject.issanceQty) // n < 18446744073709551615
        if (issuanceQty >= BigInt(100000000)) {
            throw "Asset quantity is too high, limit: 100,000,000"
        }
        // Set description as hex
        if (dataObject.description.length <= 46) {
            description = Buffer.from(dataObject.description).toString('hex')
        } else {
            throw "Issuance: Description is too long, limit: 46 chars"
        }

        // Create hex data chunk
        // const xcpDataChunk = header + messageID + assetID + issuanceQty + divisibility + callable + callDate + callPrice + description
        // 16 + 8 + 8 + 1 + 1 + 4 + 4
        const xcpDataChunk = header + messageID + assetID + issuanceQty + divisibility + "0000" + description

        console.log("XCP DATA: ")
        console.log(xcpDataChunk)
        console.log(xcpDataChunk.length)

        return xcpDataChunk

    }

    // SUBASSET ISSUANCE
    // Note: way easier to just call create_issuance
    if (dataObject.mode == "issuanceSub") {

        // Subasset data chunk example
        // 434e545250525459 | 15 | c24e2af2c5cc8b63 | 0000000000000001 | 00 | 0000 | 0903b699c3d0e67527be | 746573742869657329
        // Prefix | asset ID | qty | longname | description

        // ISSUANCE VARS                    Max datachunk length: 160
        // Prefix:                          434e545250525459
        // ID                               20 (00000014)
        // Asset ID                         0000000000000001 - 16 length
        let issuanceQty = ""                // Asset qty:   0000000000000000 = 0 (Quantity)
        let divisibility = "00"             // 00 = 0 (Divisibility, 1 = divisible)
        let longname = ""                   // 044c4f434b = LOCK (To lock description)

        // Create hex chunk
        // Prefix
        messageID = "15"
        assetID = decToHex(16, assetToID(dataObject.assetName)) // Base 68??
        issuanceQty = decToHex(16, dataObject.issanceQty)
        // Divisible
        let noIdea = "0000"
        // Call date
        // Call Price
        // Set description as hex
        if (dataObject.longname.length <= 28) {
            longname = Buffer.from(dataObject.longname).toString('hex')
        } else {
            throw "Issuance: Description is too long"
        }

        // Create hex data chunk
        const xcpDataChunk = header + messageID + assetID + issuanceQty + divisibility + noIdea + longname

        console.log("XCP DATA: ")
        console.log(xcpDataChunk)
        console.log(xcpDataChunk.length)

        return xcpDataChunk

    }

}

// Funcs for data chunk
const decToHex = (n, assetIdNum) => {

    let hexConverted = hexConverter.decToHex(assetIdNum.toString(), { prefix: false })

    while(hexConverted.length < n) {
        hexConverted = "0" + hexConverted
    }
    return hexConverted

}

function getPubKeyHash(address) {

    let pubKeyHashObj
    if ((dataObject.destination[0]).toString() == "1") {
        // If base58
        pubKeyHashObj = bitcoin.address.fromBase58Check(dataObject.destination).hash
    } else if ((dataObject.destination.slice(0,3)).toString() == "bc1") {
        // If bech32
        pubKeyHashObj = bitcoin.address.fromBech32(dataObject.destination).hash
    } else {
        return {
            success: false,
            error: "Invalid address"
        }
    }
    
    // If version is 0 then prepend "00" hex header, else pass through hash
    const pubKeyHash = parseInt(bitcoin.address.fromBase58Check(dataObject.destination).version) === 0 ? "00" + pubKeyHashObj.toString("hex") : pubKeyHashObj.toString("hex")

    return pubKeyHash
}

function ascii_to_hex(str)
{
    let arr1 = [];
    for (let n = 0, l = str.length; n < l; n ++) 
    {
        let hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}