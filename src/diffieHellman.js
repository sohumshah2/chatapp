/* global BigInt */
import { Buffer } from 'buffer';

// const { BigInt } = globalThis;

const crypto = require('crypto');
const hkdf = require('js-crypto-hkdf')
const secureRandom = require('secure-random');


// var aes256 = require('aes256');


let decomposeIntoPowersOf2 = (num) => {
    const powersOf2 = []
    let i = BigInt(1)
    let log_i = 0
    while (i <= num) {
        if (i & num) {
            powersOf2.push(log_i)
        }
        i <<= BigInt(1)
        log_i++
    }
    return powersOf2
}

let compute = (base, decomposedPower, mod) => {
    let prev = BigInt(base) % BigInt(mod)
    let res = BigInt(1)
    let j = BigInt(0)

    if (decomposedPower[0] == 0) {
        res = prev
        j++
    }

    let i = 1

    while (i <= decomposedPower[decomposedPower.length - 1]) {
        prev = (BigInt(prev) ** BigInt(2)) % BigInt(mod)
        if (decomposedPower[j] === i) {
            res = (res * prev) % mod
        }
        if (decomposedPower[j] <= i) {
            j++
        }
        i++
    }
    return res
}


const bigintToUint8Array = (bigint) => {
    let hex = bigint.toString(16);  
    if (hex.length % 2 !== 0) {
      hex = '0' + hex;
    }
  
    const byteArray = [];
    for (let i = 0; i < hex.length; i += 2) {
      byteArray.push(parseInt(hex.slice(i, i + 2), 16));
    }

    return new Uint8Array(byteArray);
  }

  let uint8ArrayToHexString = (uint8Array) => {
    return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }


const pString = `
FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1
29024E08 8A67CC74 020BBEA6 3B139B22 514A0879 8E3404DD
EF9519B3 CD3A431B 302B0A6D F25F1437 4FE1356D 6D51C245
E485B576 625E7EC6 F44C42E9 A637ED6B 0BFF5CB6 F406B7ED
EE386BFB 5A899FA5 AE9F2411 7C4B1FE6 49286651 ECE45B3D
C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8 FD24CF5F
83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D
670C354E 4ABC9804 F1746C08 CA18217C 32905E46 2E36CE3B
E39E772C 180E8603 9B2783A2 EC07A28F B5C55DF0 6F4C52C9
DE2BCBF6 95581718 3995497C EA956AE5 15D22618 98FA0510
15728E5A 8AAAC42D AD33170D 04507A33 A85521AB DF1CBA64
ECFB8504 58DBEF0A 8AEA7157 5D060C7D B3970F85 A6E1E4C7
ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226 1AD2EE6B
F12FFA06 D98A0864 D8760273 3EC86A64 521F2B18 177B200C
BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0 74E5AB31
43DB5BFC E0FD108E 4B82D120 A93AD2CA FFFFFFFF FFFFFFFF
`;
const pStringNoWhitespace = pString.replace(/\s/g, '')
const p = BigInt('0x' + pStringNoWhitespace)
const g = BigInt(2)


export const generateKeyToSend = () => {
    // const a = crypto.randomBytes(32);
    const aArray = secureRandom(32, {type: 'Array'})
    const binaryString = aArray.map(value => value.toString(2).padStart(8, '0')).join('');
    const aBigInt = BigInt('0b' + binaryString);

    // const aBigInt = BigInt('0x' + a.toString('hex'))
    // const aBigInt = BigInt('0xABCDEF')
    const A = compute(g, decomposeIntoPowersOf2(aBigInt), p)
    return {aBigInt, A}
}
export const computeSymmetricKey = (aBigInt, B) => {
    return new Promise((resolve, reject) => {
        const keyInput = compute(BigInt(B), decomposeIntoPowersOf2(aBigInt), p);
        const keyInputArray = bigintToUint8Array(keyInput);
        const hash = 'SHA-256';
        const length = 32;
        const info = '';
        const salt = new Uint8Array();
        hkdf.compute(keyInputArray, hash, length, info, salt)
            .then((derivedKey) => {
                const aesKey = uint8ArrayToHexString(derivedKey.key);
                // console.log('aeskey here', aesKey);
                resolve(aesKey);
            })
            .catch(reject);
    });
}

// let aInfo = generateKeyToSend();
// let bInfo = generateKeyToSend();
// console.log(aInfo.aBigInt, '\n', '\n', bInfo.A);

// computeSymmetricKey(aInfo.aBigInt, bInfo.A)
//     .then((aesKey) => {
//         console.log('aesKey returned', aesKey);
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });

// const a = crypto.randomBytes(32);
// const aBigInt = BigInt('0x' + a.toString('hex'))
// const A = compute(g, decomposeIntoPowersOf2(aBigInt), p)

// const b = crypto.randomBytes(32);
// const bBigInt = BigInt('0x' + b.toString('hex'))
// const B = compute(g, decomposeIntoPowersOf2(bBigInt), p)

// const s1 = compute(B, decomposeIntoPowersOf2(aBigInt), p);
// const s2 = compute(A, decomposeIntoPowersOf2(bBigInt), p);

// console.log('p', p.toString(16));
// console.log('g', g.toString(16));
// console.log('a', aBigInt.toString(16));
// console.log('A', A.toString(16));
// console.log('b', bBigInt.toString(16));
// console.log('B', B.toString(16));
// console.log('s1', s1.toString(16));
// console.log('\n', 's2', s2.toString(16));
// console.log(s1 === s2);

// const key = bigintToUint8Array(s1)
// const hash = 'SHA-256'
// const length = 32
// const info = ''
// const salt = new Uint8Array()
// let aesKey = ''
// hkdf.compute(key, hash, length, info, salt).then( (derivedKey) => {
//     // now you get a key derived from the masterSecret
//     console.log('-----------------------')
//     console.log(derivedKey.key)
//     console.log('-----------------------')
//     console.log(uint8ArrayToHexString(derivedKey.key))
//     aesKey = uint8ArrayToHexString(derivedKey.key)

//     var encryptedPlainText = aes256.encrypt(aesKey, 'hello');
//     console.log(encryptedPlainText)
//     var decryptedPlainText = aes256.decrypt(aesKey, encryptedPlainText)
//     console.log(decryptedPlainText)



//   });
  





//   hkdf.compute(bigintToUint8Array(s2), hash, length, info, salt).then( (derivedKey) => {
//     // now you get a key derived from the masterSecret
//     console.log(uint8ArrayToHexString(derivedKey))
//   });