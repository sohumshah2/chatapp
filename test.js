const aes256 = require('aes256');


const message = '8QSh5JRXSETmi+UDKhhQ3B44nhqM'
const aesKey = 'f1b1a0126109cbd2cd2cd180180b9bd22a7c052c7c6e85ecfac1dba9feab9d56'
const decryptedMessage = aes256.decrypt(aesKey, message)    
console.log(decryptedMessage)


const encryptedMessage = aes256.encrypt(aesKey, 'hello')    
console.log(encryptedMessage)