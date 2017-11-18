const messages = require('./messages');
const aggregation = require('./aggregation');

/* const init = (async () => {
  await messages.connect();
  await messages.consume()
    .on('message', aggregation);
})();

init.then(() => {
  console.log('Wait for commands');
}, console.error.bind(console)); */

(async () => {
  await aggregation();
})();
