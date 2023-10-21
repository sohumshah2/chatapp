const aes256 = require("aes256");
const readline = require('readline');
const io = require('socket.io-client');
const socket = io('https://chatappserver-ucb7.onrender.com');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let aesKeyWithTargetA, aesKeyWithTargetB;
const targetA = 'Magnus';
const targetB = 'Elia';

function sendMessage(receiver, message) {
  const encryptedMessage = aes256.encrypt(receiver === targetA ? aesKeyWithTargetA : aesKeyWithTargetB, message);
  setTimeout(() => {
    socket.emit('sendMessage', {
      sender: receiver === targetA ? targetB : targetA,
      receiver: receiver,
      message: encryptedMessage,
      handshake: false,
    });
  }, 100);
}

const askRecipientAndMessage = () => {
  rl.question('Recipient: ', (receiver) => {
    rl.question('Message: ', (message) => {
      sendMessage(receiver, message);
      askRecipientAndMessage(); // Continue the loop
    });
  });
};

rl.question('aesKeyWithTargetA: ', (keyA) => {
  aesKeyWithTargetA = keyA;

  rl.question('aesKeyWithTargetB: ', (keyB) => {
    aesKeyWithTargetB = keyB;
    askRecipientAndMessage(); // Start the loop
  });
});
