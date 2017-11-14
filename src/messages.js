const amqp = require('amqplib');
const { EventEmitter } = require('events');

const queue = process.env.AGGREGATION_QUEUE;
const rabbitUrl = 'amqp://guest:guest@localhost';

let connection;

const connect = async () => amqp.connect(rabbitUrl);

exports.consume = async () => {
  if (!connection) {
    connection = await connect();
  }
  
  const channel = await connection.createChannel();
  await channel.assertQueue(queue);

  const events = new EventEmitter();

  channel.consume(queue, events.emit.bind(events, 'message'));

  return events;
};

exports.connect = connect;
