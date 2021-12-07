// Create TestDB for github workflow container.
const { Client } = require("pg");

const pgclient = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

// ALEC TODO - remove
console.log(process.env.POSTGRES_HOST);
console.log(process.env.POSTGRES_PORT);

pgclient.connect();

pgclient.query(`CREATE DATABASE testing`, (err, res) => {
  if (err) throw err;
  pgclient.end();
});
