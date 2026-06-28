// MagnetFi v2 — read-only on-chain queries (algosdk only, no algokit-utils, no signing).
// Kept separate from magnetfiClient so the default (Overview) view stays lightweight.

import algosdk from "algosdk";
import { ACTIVE, PSM_REDEEM_FEE_BPS } from "./magnetfi";

const ORACLE_FRESHNESS = 1_800; // 30 min

export const MUSD_ID = ACTIVE.musd;
export const USDC_ID = ACTIVE.usdc;
export const LP_ID = ACTIVE.lpAsaId;
export const POOL_ID = ACTIVE.poolId;
export const REDEEM_FEE_BPS = PSM_REDEEM_FEE_BPS;

const fromBase = (base: number | bigint) => Number(base) / 1_000_000;
const appAddr = (id: number) => algosdk.getApplicationAddress(id).toString();

function globalUint(app: algosdk.modelsv2.Application, keyBytes: Uint8Array): number | undefined {
  const target = Buffer.from(keyBytes).toString("base64");
  const gs = app.params.globalState ?? [];
  for (const kv of gs) {
    const k = typeof kv.key === "string" ? kv.key : Buffer.from(kv.key).toString("base64");
    if (k === target && kv.value.type === 2) return Number(kv.value.uint);
  }
  return undefined;
}

const poolKey = (prefix: string) =>
  new Uint8Array([...Buffer.from(prefix), ...algosdk.encodeUint64(BigInt(ACTIVE.poolId))]);

export type OracleInfo = { price: number; ts: number; fresh: boolean };

export async function getOracle(algod: algosdk.Algodv2): Promise<OracleInfo> {
  const app = await algod.getApplicationByID(ACTIVE.oracle).do();
  const price = globalUint(app, poolKey("lp_price_")) ?? 0;
  const ts = globalUint(app, poolKey("lp_ts_")) ?? 0;
  const now = Math.floor(Date.now() / 1000);
  return { price: price / 1_000_000, ts, fresh: ts > 0 && now - ts <= ORACLE_FRESHNESS };
}

export type ProtocolStats = { circulating: number; ceiling: number; psmUsdc: number; oracle: OracleInfo };

export async function getProtocolStats(algod: algosdk.Algodv2): Promise<ProtocolStats> {
  const asset = await algod.getAssetByID(ACTIVE.musd).do();
  const total = Number(asset.params.total);
  const psm = await algod.accountInformation(appAddr(ACTIVE.psm)).do();
  const held = new Map((psm.assets ?? []).map((x) => [Number(x.assetId), Number(x.amount)]));
  const psmMusd = held.get(ACTIVE.musd) ?? 0;
  const psmUsdc = held.get(ACTIVE.usdc) ?? 0;
  const circulating = total - psmMusd;
  return {
    circulating: fromBase(circulating),
    ceiling: fromBase(Math.max(0, psmUsdc - circulating)),
    psmUsdc: fromBase(psmUsdc),
    oracle: await getOracle(algod),
  };
}

export type VaultPosition = {
  lpAmount: number; musdBorrowed: number; accruedInterest: number;
  rateBps: number; lastPaymentTs: number; vaultState: number;
};

export async function getVaultPosition(algod: algosdk.Algodv2, borrower: string): Promise<VaultPosition | null> {
  const name = new Uint8Array([
    ...Buffer.from("vault_"),
    ...algosdk.decodeAddress(borrower).publicKey,
    ...algosdk.encodeUint64(BigInt(ACTIVE.poolId)),
  ]);
  try {
    const box = await algod.getApplicationBoxByName(ACTIVE.vault, name).do();
    const v = new DataView(box.value.buffer, box.value.byteOffset, box.value.byteLength);
    const u = (i: number) => Number(v.getBigUint64(i * 8));
    return {
      lpAmount: fromBase(u(0)), musdBorrowed: fromBase(u(2)), accruedInterest: fromBase(u(3)),
      rateBps: u(4), lastPaymentTs: u(6), vaultState: u(7),
    };
  } catch {
    return null;
  }
}

export type Balances = {
  algo: number; musd: number; usdc: number; lp: number;
  optedMusd: boolean; optedUsdc: boolean; optedLp: boolean;
};

export async function getBalances(algod: algosdk.Algodv2, address: string): Promise<Balances> {
  const info = await algod.accountInformation(address).do();
  const held = new Map((info.assets ?? []).map((x) => [Number(x.assetId), Number(x.amount)]));
  return {
    algo: Number(info.amount) / 1_000_000,
    musd: fromBase(held.get(ACTIVE.musd) ?? 0),
    usdc: fromBase(held.get(ACTIVE.usdc) ?? 0),
    lp: fromBase(held.get(ACTIVE.lpAsaId) ?? 0),
    optedMusd: held.has(ACTIVE.musd),
    optedUsdc: held.has(ACTIVE.usdc),
    optedLp: held.has(ACTIVE.lpAsaId),
  };
}
