import algosdk from "algosdk";
import { ALGOD_URLS, INDEXER_URLS } from "./constants";

export function getAlgodClient(network: "testnet" | "mainnet" = "testnet") {
  return new algosdk.Algodv2("", ALGOD_URLS[network], "");
}

export function getIndexerClient(network: "testnet" | "mainnet" = "testnet") {
  return new algosdk.Indexer("", INDEXER_URLS[network], "");
}

export async function getAccountInfo(address: string, network: "testnet" | "mainnet" = "testnet") {
  const client = getAlgodClient(network);
  return await client.accountInformation(address).do();
}

export async function getAppGlobalState(
  appId: number,
  network: "testnet" | "mainnet" = "testnet"
): Promise<Map<string, bigint | Uint8Array>> {
  const client = getAlgodClient(network);
  const appInfo = await client.getApplicationByID(appId).do();
  const state = new Map<string, bigint | Uint8Array>();

  const params = appInfo.params as unknown as Record<string, unknown>;
  const globalState = params["global-state"] ?? params["globalState"];

  if (globalState && Array.isArray(globalState)) {
    for (const entry of globalState) {
      const key = typeof atob !== "undefined"
        ? atob(entry.key)
        : Buffer.from(entry.key, "base64").toString();
      if (entry.value.type === 1) {
        state.set(key, BigInt(entry.value.uint));
      } else {
        const bytes = typeof atob !== "undefined"
          ? atob(entry.value.bytes)
          : Buffer.from(entry.value.bytes, "base64").toString();
        state.set(key, Uint8Array.from(bytes, (c) => c.charCodeAt(0)));
      }
    }
  }

  return state;
}

export async function getAssetInfo(asaId: number, network: "testnet" | "mainnet" = "testnet") {
  const client = getAlgodClient(network);
  return await client.getAssetByID(asaId).do();
}

export function addressFromPublicKey(publicKey: Uint8Array): string {
  return algosdk.encodeAddress(publicKey);
}

export function formatMicroAlgos(microAlgos: number | bigint): string {
  const algos = Number(microAlgos) / 1_000_000;
  return algos.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function formatAmount(amount: number | bigint, decimals: number = 0): string {
  const value = Number(amount) / Math.pow(10, decimals);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
