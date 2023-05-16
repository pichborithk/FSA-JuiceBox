const express = require('express');
const morgan = require('morgan');

const { client, PORT } = require('./config/default');
const apiRouter = require('./api');

const server = express();

server.use(morgan('dev'));
server.use(express.json());

server.use((req, res, next) => {
  console.log('<____Body Logger START____>');
  console.log(req.body);
  console.log('<_____Body Logger END_____>');

  next();
});

server.use('/api', apiRouter);

client.connect();

server.listen(PORT, () => {
  console.log('The server is up on port', PORT);
});
