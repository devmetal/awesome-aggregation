const messages = require('./messages');

const onMessage = (message) => {
  console.log(message);
}

const init = (async () => {
  await messages.connect();
  await messages.consume()
    .on('message', onMessage);
})();

init.then(() => {
  console.log('Wait for commands');
}, console.error.bind(console));
