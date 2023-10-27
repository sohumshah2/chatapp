/* global BigInt */
const { SHA256, enc } = require('crypto-js');
const getlargePrime = require('get-large-prime');

const decomposeIntoPowersOf2 = (num) => {
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

const compute = (base, decomposedPower, mod) => {
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


const inverseModulo = (inputA, inputN) => {
    let a
    let n
    
    if (inputA < inputN) {
        a = inputA
        n = inputN
    } else {
        a = inputN
        n = inputA
    }
    
    let q
    let r
    let arr = []
    
    
    while (r != 1 && r != 0) {
        q = n / a
        r = n - a * q
        if (r === 0) {
            break
        }
        arr.push({a, n, q, r})
        n = a
        a = r
    }
    console.log(arr)
    
    
    let coeffOfN = BigInt(1)
    let coeffOfA = BigInt(-1) * arr[arr.length - 1].q
    let oldCoeffOfN
    
    for (let i = arr.length - 2; i >= 0; i--) {
        oldCoeffOfN = coeffOfN
        coeffOfN = coeffOfA
        coeffOfA = oldCoeffOfN - arr[i].q * coeffOfA
    }
    
    if (coeffOfA < 0) {
        coeffOfA += inputN
    }
    
    if (coeffOfN < 0) {
        coeffOfN += inputN
    }
    
    if (inputA > inputN) {
        return coeffOfN
    } else {
        return coeffOfA
    }
}



   export const generateKeys = async () => {
    const largePrime1 = await getlargePrime(1024); // maybe implement myself later
    const p = BigInt(largePrime1);
    
    const largePrime2 = await getlargePrime(1024);
    const q = BigInt(largePrime2);
    
    const n = p * q;
    const m = (p - BigInt(1)) * (q - BigInt(1));
    const e = BigInt(65537);
    // const d = bigintModArith.modInv(e, m); // likely will implement myself with extended euclidean
    const d = inverseModulo(e, m);

    return { n, e, d };
}

   export const hashAndEncrypt = (message, n, d) => {
    const sha256HashHex = SHA256(message.toString()).toString(enc.Hex)
    const sha256HashBigInt = BigInt("0x" + sha256HashHex);
    const s = compute(sha256HashBigInt, decomposeIntoPowersOf2(d), n)
    return s
}

  export const confirmWhetherMatch = (receivedMessage, receivedEncryptedHash, e, n) => {
    // const calculatedHashHex = crypto.createHash('sha256').update(receivedMessage).digest('hex');
    const calculatedHashHex = SHA256(receivedMessage.toString()).toString(enc.Hex)
    const calculatedHashBigInt = BigInt("0x" + calculatedHashHex);
    const decryptedHash = compute(BigInt(receivedEncryptedHash), decomposeIntoPowersOf2(e), n)
    return calculatedHashBigInt === decryptedHash
}



    // inputA = BigInt(65537)
    // inputN = BigInt('1348450684385427257550265277802706772370309387317696444602626707391812816235317742560905477323664773341147003138554069421979289140029773739456704747080267968437467332829665037779432725113157460739728366432930340776542246561642361700051983970579995393986655869737988407791079488611275002750358628889158799340003608122583080324185562288532826765609585740714186093865594761975357862382796388737945461837921797630523480032394634426572807008815529161145703756009436791521599433421230812524638464515860650692521640605591605466510590067905830595998645687643951338678952884098677278555640534008252470560391635147907887055617')

    // const d = bigintModArith.modInv(BigInt(65537), inputN); // likely will implement myself with extended euclidean
    // console.log(d.toString())


// generateKeys()
//     .then(keys => {
//         console.log('keys', keys);
//         const encryptedHash = hashAndEncrypt('wassup', keys.n, keys.d)
//         console.log('encryptedHash', encryptedHash)
//         console.log('match?', confirmWhetherMatch('wassup', encryptedHash, keys.e, keys.n))
//     });

// return



// console.log(bigintModArith.modPow(BigInt(123), BigInt(23), BigInt(323)))
// console.log(compute(BigInt(123), decomposeIntoPowersOf2(BigInt(23)), BigInt(323)))


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