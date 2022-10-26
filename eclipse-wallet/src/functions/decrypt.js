
function hexToString(data) {

    var hex = data.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str

    // return data.toString(16)

}

// ENHANCED SEND
// "02" = Enhanced send
// eg: "02645540282f97d55b000000000000000100173580c61f3c4df958bc053f94e13d73849a3a77"
// tx: "cf905c8427bee0ef6204a7829706147b46f2b079f648837291003dbe4b3fa8d9"

// BROADCAST
// 


console.log(xcpEncoding(
    "1e62fc6d240000000000000000000000001f6d696e742071756573746672656e2032383620577554616e674b696c6c6142"
    ))

// 1e62fc6d240000000000000000000000001f6d696e742071756573746672656e2032383620577554616e674b696c6c6142