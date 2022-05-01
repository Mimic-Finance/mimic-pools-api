const express = require("express");
const route = express.Router();

const { MongoClient } = require("mongodb");
const uri = process.env.DB_CONNECT_STRING;

route.post("/", async (req, res) => {
  const pool = req.body;
  const client = new MongoClient(uri);
  await client.connect();
  await client.db("mimic-info").collection("farm").insertOne(pool);
  await client.close();
  res.status(200).send({
    pool: pool,
  });
});

route.get("/", async (req, res) => {
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

route.get("/:address", async (req, res) => {
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

route.get("/clear", async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const pools = await client.db("mimic-info").collection("farm").drop({});
  await client.close();
  res.status(200).send(pools);
});

module.exports = route;
