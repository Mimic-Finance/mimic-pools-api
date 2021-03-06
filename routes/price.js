//Define ABI and ether abi
const { ethers } = require("ethers");
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

const { getAbi, getPoolImmutables } = require("../libs/helpers");
const INFURA_URL = process.env.INFURA_URL;

const PROVIDER = new ethers.providers.JsonRpcProvider(
  "https://kovan.poa.network/"
);
const QUOTER_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

const { MongoClient } = require("mongodb");
const uri = process.env.DB_CONNECT_STRING;

//Define Express App
const express = require("express");
const route = express.Router();

route.get("/", async (req, res) => {
  return res.status(200).json({ message: "Mimic Finance Price API" });
});

route.get("/fetch/:poolAddress", async (req, res) => {
  try {
    const client = new MongoClient(uri);

    const price_data = await getPrice(1, req.params.poolAddress);
    await client.connect();
    await client.db("price").collection(req.params.poolAddress).insertOne({
      price: price_data.amountOut,
      token1: price_data.tokenSymbol0,
      token2: price_data.tokenSymbol1,
      updateAt: new Date(),
    });
    await client.close();

    return res.status(200).json(price_data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

route.get("/:poolAddress", async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const prices = await client
      .db("price")
      .collection(req.params.poolAddress)
      .find({})
      .sort({ updateAt: -1 })
      .toArray();

    await client.close();

    res.status(200).send(prices.length > 0 ? prices[0] : {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

route.get("/clear/:poolAddress", async (req, res) => {
  const client = new MongoClient(uri);
  await client.connect();
  const pools = await client
    .db("price")
    .collection(req.params.poolAddress)
    .drop({});
  await client.close();
  res.status(200).send(pools);
});

/*=======================GET PRICE FUNCTION==============================*/

const getPrice = async (inputAmount, poolAddress) => {
  const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    PROVIDER
  );

  const tokenAddress0 = await poolContract.token1();
  const tokenAddress1 = await poolContract.token0();

  const tokenAbi0 = await getAbi(tokenAddress0);
  const tokenAbi1 = await getAbi(tokenAddress1);

  const tokenContract0 = new ethers.Contract(
    tokenAddress0,
    tokenAbi0,
    PROVIDER
  );
  const tokenContract1 = new ethers.Contract(
    tokenAddress1,
    tokenAbi1,
    PROVIDER
  );

  const tokenSymbol0 = await tokenContract0.symbol();
  const tokenSymbol1 = await tokenContract1.symbol();
  const tokenDecimals0 = await tokenContract0.decimals();
  const tokenDecimals1 = await tokenContract1.decimals();

  const quoterContract = new ethers.Contract(
    QUOTER_ADDRESS,
    QuoterABI,
    PROVIDER
  );

  const immutables = await getPoolImmutables(poolContract);

  const amountIn = ethers.utils.parseUnits(
    inputAmount.toString(),
    tokenDecimals0
  );

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    immutables.token1,
    immutables.token0,
    immutables.fee,
    amountIn,
    0
  );

  const amountOut = ethers.utils.formatUnits(quotedAmountOut, tokenDecimals1);

  const result = {
    inputAmount: inputAmount,
    tokenSymbol0: tokenSymbol0,
    amountOut: amountOut,
    tokenSymbol1: tokenSymbol1,
    message: `${inputAmount} ${tokenSymbol0} can be swapped for ${amountOut} ${tokenSymbol1}`,
  };

  return result;
};

module.exports = route;
