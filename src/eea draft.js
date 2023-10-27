inputA = BigInt(65537)
inputN = BigInt('1348450684385427257550265277802706772370309387317696444602626707391812816235317742560905477323664773341147003138554069421979289140029773739456704747080267968437467332829665037779432725113157460739728366432930340776542246561642361700051983970579995393986655869737988407791079488611275002750358628889158799340003608122583080324185562288532826765609585740714186093865594761975357862382796388737945461837921797630523480032394634426572807008815529161145703756009436791521599433421230812524638464515860650692521640605591605466510590067905830595998645687643951338678952884098677278555640534008252470560391635147907887055617')


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

res = inverseModulo(inputA, inputN)
console.log(res.toString())
// console.log((res + inputN).toString())