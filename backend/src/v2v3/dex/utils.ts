import { AxiosError, AxiosResponse } from "axios";

const axios = require("axios").default;

export async function getData(url: string): Promise<any | null> {
  return await axios
    .get(url)
    .then((response: AxiosResponse) => {
      return response.data;
    })
    .catch(function (error: AxiosError) {
      console.error("ERROR:", error.message);
      return null;
    });
}

export async function getPrice(asset: string): Promise<number | null> {
  const assetUrl = `https://api.stellar.expert/explorer/public/asset/${asset}/stats-history`;
  const priceData = await getData(assetUrl).then((data) => data.at(-1));

  if (!priceData) return null;

  const prices = priceData?.price;
  return (prices[0] + prices.at(-1)) / 2;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }
}
