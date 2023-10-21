const { generateKeyToSend, computeSymmetricKey } = require('./diffieHellmanAtkr.js');


const io = require('socket.io-client'); // Import the socket.io-client library
const aes256 = require("aes256");


const socket = io('https://chatappserver-ucb7.onrender.com'); // Replace with the actual server URL

const targetA = 'a'
const targetB = 'b'
let interceptedTargetA = false
let interceptedTargetB = false
let diffieHellmanPrivateUs = BigInt(0)
let diffieHellmanPublicUs = BigInt(0)
let diffieHellmanPublicTargetA = BigInt(0)
let diffieHellmanPublicTargetB = BigInt(0)
let aesKeyWithTargetA = BigInt(0)
let aesKeyWithTargetB = BigInt(0)
const ourMessages = []





socket.on('connect', () => {
  console.log('Connected to the server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

socket.on('broadcastMessage', (message) => {
  // console.log('Received message:', message.message.length < 100 ? message : 'A LOT OF JUNK');

  if (message.sender === targetA && message.receiver === targetB && !interceptedTargetA) {
    interceptedTargetA = true
    diffieHellmanPublicTargetA = message.message
    const dh = generateKeyToSend()
    diffieHellmanPrivateUs = dh.aBigInt
    diffieHellmanPublicUs = dh.A
    
    computeSymmetricKey(diffieHellmanPrivateUs, diffieHellmanPublicTargetA).then((aesKey) => {
      aesKeyWithTargetA = aesKey
      console.log(aesKeyWithTargetA)
    })

    ourMessages.push(diffieHellmanPublicUs.toString())
    setTimeout(() => {
      socket.emit('sendMessage', {
        sender: targetB,
        receiver: targetA,
        message: diffieHellmanPublicUs.toString(),
        handshake: true,
      })
    }, 1000) 
  }

  else if (message.sender === targetB && message.receiver === targetA && !interceptedTargetB) {
    interceptedTargetB = true
    diffieHellmanPublicTargetB = message.message
    
    computeSymmetricKey(diffieHellmanPrivateUs, diffieHellmanPublicTargetB).then((aesKey) => {
      aesKeyWithTargetB = aesKey
      console.log(aesKeyWithTargetB)
    })

    ourMessages.push(diffieHellmanPublicUs.toString())
    setTimeout(() => {
      socket.emit('sendMessage', {
        sender: targetA,
        receiver: targetB,
        message: diffieHellmanPublicUs.toString(),
        handshake: true,
      })
    }, 1000) 
  }

  else if (message.sender === targetA && message.receiver === targetB && interceptedTargetA && interceptedTargetB && !ourMessages.includes(message.message)) {
    const decryptedMessage = aes256.decrypt(aesKeyWithTargetA, message.message)
    console.log(`***** ${targetA} -> ${targetB}: ${decryptedMessage.length < 100 ? decryptedMessage : 'A LOT OF JUNK'}`)

    const encryptedMessage = aes256.encrypt(aesKeyWithTargetB, decryptedMessage)
    ourMessages.push(encryptedMessage)
    setTimeout(() => {
      socket.emit('sendMessage', {
        sender: targetA,
        receiver: targetB,
        message: encryptedMessage,
        handshake: false,
      })
    }, 100);
  }

  else if (message.sender === targetB && message.receiver === targetA && interceptedTargetA && interceptedTargetB && !ourMessages.includes(message.message)) {
    const decryptedMessage = aes256.decrypt(aesKeyWithTargetB, message.message)
    console.log(`***** ${targetB} -> ${targetA}: ${decryptedMessage.length < 100 ? decryptedMessage : 'A LOT OF JUNK'}`)

    const encryptedMessage = aes256.encrypt(aesKeyWithTargetA, decryptedMessage)
    ourMessages.push(encryptedMessage)
    setTimeout(() => {
      socket.emit('sendMessage', {
        sender: targetB,
        receiver: targetA,
        message: encryptedMessage,
        handshake: false,
      })
    }, 100);
  }





});

// Function to send a message to the server
function sendMessage(message) {
  socket.emit('sendMessage', message);
}

