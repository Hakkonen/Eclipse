// Returns random asset ID

import { BigIntegerSM } from "../lib/bigint"

export default function createRandomID() {

    let assetID = "A111"

    for (let i = 1; i < 18; i++) {
        assetID += Math.floor(Math.random()*(9-0+1)+0)
    }
    
    return assetID
}