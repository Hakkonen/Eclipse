// Ingests asset name and returns asset id

import { BigIntegerSM } from "../lib/bigint"

export default function assetToID(asset_name) {

    // Adapted from Loon's freeport, utilises b26 for unique names
    // https://github.com/loon3/Freeport-extension/blob/7f6b9aac088596fc47170dce9c566e6403a29070/Chrome%20Extension/js/xcp-js/transactions.js#L135

    let asset_id

    if (asset_name == "XCP") {
        
        asset_id = (1).toString(16);
        
    } else if (asset_name == "BTC") { 
        
        asset_id = (0).toString(16);
    
    } else if (asset_name.substr(0, 1) == "A") {
        
        let pre_id = asset_name.substr(1);
        
        let pre_id_bigint = BigInt(pre_id);
        
        asset_id = pre_id_bigint.toString();

    } else {  

        let b26_digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
        let name_array = asset_name.split("");

        let n_bigint = BigIntegerSM(0);
    
        for (let i = 0; i < name_array.length; i++) { 

            n_bigint = BigIntegerSM(n_bigint).multiply(26);
            n_bigint = BigIntegerSM(n_bigint).add(b26_digits.indexOf(name_array[i]));

        }    

        asset_id = n_bigint.toString();
    
    } 
    
    //return asset_id;
    
    return asset_id;

}