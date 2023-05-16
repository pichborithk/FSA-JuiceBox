require('dotenv').config();
const { Client } = require('pg');

const client = new Client(process.env.DATABASE_URL);
// const client = new Client({
//   user: 'postgres',
//   password: 'postgres',
//   database: 'juicebox-dev',
// });

const PORT = process.env.PORT || 1337;

module.exports = { client, PORT };
