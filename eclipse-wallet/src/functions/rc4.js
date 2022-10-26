/*
 * RC4 symmetric cipher encryption/decryption
 *
 * @license Public Domain
 * @param string key - secret key for encryption/decryption
 * @param string str - string to be encrypted/decrypted
 * @return string
 */
function rc4(key, str) {
	var s = [], j = 0, x, res = '';
	for (var i = 0; i < 256; i++) {
		s[i] = i;
	}
	for (i = 0; i < 256; i++) {
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
	}
	i = 0;
	j = 0;
	for (var y = 0; y < str.length; y++) {
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
		res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
	}
	return res;
}


function hex2bin(hex) {

    var bytes = [];
    var str;
    
    for (var i = 0; i < hex.length - 1; i += 2) {

            var ch = parseInt(hex.substr(i, 2), 16);
            bytes.push(ch);

    }

    str = String.fromCharCode.apply(String, bytes);
    return str;

};

function bin2hex(s) {

    // http://kevin.vanzonneveld.net

    var i, l, o = "",
            n;

    s += "";

    for (i = 0, l = s.length; i < l; i++) {
            n = s.charCodeAt(i).toString(16);
            o += n.length < 2 ? "0" + n : n;
    }

    return o;

}; 

function xcp_rc4(key, datachunk) {
    
    return bin2hex(rc4(hex2bin(key), hex2bin(datachunk)));
    
}

// console.log(xcp_rc4(
//     "bff28e9904854b518f4e073a233c62d09caac316b4e628a2442adb7318020378",
//     "5276f853cf15bbf2c9994d6cbca41a09d2720768b319856e661d9d189066f65aa994ca579a3cf62d07f3d862d7"
// ))

module.exports = { xcp_rc4 }

// 434e545250525459
// 020e24364e36e1890000000000000000019421bb74c10e173b9a76adbb9e537d91a1e30677