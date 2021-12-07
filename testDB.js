// Create TestDB for github workflow container.
const { Client } = require("pg");

const pgclient = new Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: "postgres",
  password: "postgres",
  database: "postgres",
});

pgclient.connect();

pgclient.query(`CREATE DATABASE testing`);
