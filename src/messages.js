const amqp = require('amqplib');
const { EventEmitter } = require('events');
const config = require('../config');

const rabbitConf = config.get('rabbit');
const {
  user,
  pass,
  host,
  aggregationQueue,
} = rabbitConf;

const rabbitUri = `ampq://${user}:${pass}@${host}`;

exports.consume = async () => {
  const connection = await amqp.connect(rabbitUri);
  const channel = await connection.createChannel();

  await channel.assertQueue(aggregationQueue);

  const events = new EventEmitter();
  const handler = events.emit.bind(events, 'message');

  channel.consume(aggregationQueue, handler);

  return events;
};
