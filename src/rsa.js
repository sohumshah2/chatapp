/* global BigInt */
// import { SHA256, enc } from 'crypto-js';
const { SHA256, enc } = require('crypto-js');
const getlargePrime = require('get-large-prime');
const bigintModArith = require('bigint-mod-arith')
// const crypto = require('crypto');


 export const generateKeys = async () => {
    const largePrime1 = await getlargePrime(1024); // maybe implement myself later
    const p = BigInt(largePrime1);
    
    const largePrime2 = await getlargePrime(1024);
    const q = BigInt(largePrime2);
    
    const n = p * q;
    const m = (p - BigInt(1)) * (q - BigInt(1));
    const e = BigInt(65537);
    const d = bigintModArith.modInv(e, m); // likely will implement myself with extended euclidean

    return { n, e, d };
}

 export const hashAndEncrypt = (message, n, d) => {
    // const sha256HashHex = crypto.createHash('sha256').update(message).digest('hex');
    const sha256HashHex = SHA256(message.toString()).toString(enc.Hex)
    const sha256HashBigInt = BigInt("0x" + sha256HashHex);
    const s = bigintModArith.modPow(sha256HashBigInt, d, n) // alr implemented myself in diffiehellman.js, connect it here
    return s
}

export const confirmWhetherMatch = (receivedMessage, receivedEncryptedHash, e, n) => {
    // const calculatedHashHex = crypto.createHash('sha256').update(receivedMessage).digest('hex');
    const calculatedHashHex = SHA256(receivedMessage.toString()).toString(enc.Hex)
    const calculatedHashBigInt = BigInt("0x" + calculatedHashHex);
    const decryptedHash = bigintModArith.modPow(receivedEncryptedHash, e, n)
    return calculatedHashBigInt === decryptedHash
}

generateKeys()
    .then(keys => {
        console.log('keys', keys);
        const encryptedHash = hashAndEncrypt('wassup', keys.n, keys.d)
        console.log('encryptedHash', encryptedHash)
        console.log('match?', confirmWhetherMatch('wassup', encryptedHash, keys.e, keys.n))
    });

// return






/*





// let largePrime = await getlargePrime(1024);
// console.log(largePrime.toString())

getlargePrime(1024).then((largePrime) => {
    // console.log(largePrime.toString())
    const p = BigInt(largePrime)

    getlargePrime(1024).then((largePrime) => {
        // console.log(largePrime.toString())
        const q = BigInt(largePrime)

        console.log('p', p.toString(), '\n', 'q', q.toString())

        const n = p * q
        console.log('n', n.toString())

        const m = (p - BigInt(1)) * (q - BigInt(1))
        console.log('m', m.toString())

        const e = BigInt(65537)

        // const d = mathjs.invmod('3', '4')
        console.log('e', e.toString())
        // const d = mathjs.invmod(e.toString(), m.toString())
        const d = bigintModArith.modInv(e, m)
        console.log('d', d.toString())



        const inputString = 'hello'
        const sha256HashHex = crypto.createHash('sha256').update(inputString).digest('hex');
        const sha256HashBigInt = BigInt("0x" + sha256HashHex);
        console.log('hash', sha256HashBigInt.toString());

        const s = bigintModArith.modPow(sha256HashBigInt, d, n)
        console.log('s', s.toString())

        const decryptedWithPubKey = bigintModArith.modPow(s, e, n)
        console.log('decryptedWithPubKey', decryptedWithPubKey.toString())
        console.log('hashes match', decryptedWithPubKey === sha256HashBigInt)



        


        





        // console.log(bigintModArith.modInv(BigInt('3'), BigInt('5'))) // prints 2

        
    }).catch((error) => {
        console.log(error)
    })











}).catch((error) => {
    console.log(error)
})



*/