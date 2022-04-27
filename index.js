const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const port = 3000;

dotenv.config();

const { MongoClient } = require("mongodb");
const uri = process.env.DB_CONNECT_STRING;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    message: "Mimic Info API",
    version: "1.0.0",
  });
});

app.post("/farm/pools", async (req, res) => {
  const pool = req.body;
  const client = new MongoClient(uri);
  await client.connect();
  await client.db("mimic-info").collection("farm").insertOne(pool);
  await client.close();
  res.status(200).send({
    pool: pool,
  });
});

app.get("/farm/pools", async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const pools = await client
    .db("mimic-info")
    .collection("farm")
    .find({})
    .toArray();
  await client.close();
  res.status(200).send(pools);
});

app.get("/farm/pools/:address", async (req, res) => {
  const address = req.params.address;
  const client = new MongoClient(uri);
  await client.connect();
  const pool = await client
    .db("mimic-info")
    .collection("farm")
    .find({ address: address })
    .toArray();
  await client.close();
  res.status(200).send(pool.length > 0 ? pool[0] : {});
});

app.get("/clear", async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const pools = await client.db("mimic-info").collection("farm").drop({});
  await client.close();
  res.status(200).send(pools);
});

app.listen(port, () => {
  console.log(`API listening at port:${port}`);
});
