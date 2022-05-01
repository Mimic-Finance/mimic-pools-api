const express = require("express");
const route = express.Router();

const { MongoClient } = require("mongodb");
const uri = process.env.DB_CONNECT_STRING;

route.get("/", async (req, res) => {
  return res.status(200).json({ stat: "ok" });
});

route.get("/farms", async (req, res) => {
  return res.status(200).json([
    {
      pool: "0x0000000000000000000000000000000000000000",
      symbol: "BUSD",
      TVD: "10325326",
    },
    {
      pool: "0x0000000000000000000000000000000000000000",
      symbol: "USDT",
      TVD: "32535656",
    },
    {
      pool: "0x0000000000000000000000000000000000000000",
      symbol: "DAI",
      TVD: "456734354",
    },
  ]);
});

route.get("/farms/:pool", async (req, res) => {
  const pool = req.params.pool;
  return res.status(200).json([
    {
      pool: pool,
      symbol: "ETH",
      TVD: "10325436874326",
    },
  ]);
});

route.get("/price", async (req, res) => {
  return res.status(200).json([
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "JUSD",
      price: "1",
    },
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "MIM",
      price: "0.17",
    },
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "cJUSD",
      price: "1",
    },
  ]);
});

module.exports = route;
