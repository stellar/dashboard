export const ORIGINAL_SUPPLY_AMOUNT: string;
export function getLumenBalance(
  horizonURL: string,
  accountId: string,
): Promise<string>;
export function totalLumens(horizonURL: string): Promise<string>;
export function inflationLumens(): Promise<BigNumber>;
export function feePool(): Promise<string>;
export function burnedLumens(): Promise<string>;
export function directDevelopmentAll(): Promise<string>;
export function distributionProductAndInnovation(): Promise<string>;
export function distributionGrowth(): Promise<string>;
export function distributionAssetsAndLiquidity(): Promise<string>;
export function distributionAll(): Promise<BigNumber>;
export function getUpgradeReserve(): Promise<string>;
export function sdfAccounts(): Promise<BigNumber>;
export function totalSupply(): Promise<BigNumber>;
export function noncirculatingSupply(): Promise<BigNumber>;
export function circulatingSupply(): Promise<BigNumber>;
