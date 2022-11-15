import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { MaxUint256 } from '@ethersproject/constants';

const { Multicaller, getProvider } = snapshot.utils;

export const BOOST_ADDRESS = '0xaf8b6af86044821eED74E49057De62fB5C48e061';

export const SNAPSHOT_GUARD_ADDRESS =
  '0xF63EB3f569C6cB8F5Cf37caD183790Ed1b251c91';

export const GUARDS = {
  '0xF63EB3f569C6cB8F5Cf37caD183790Ed1b251c91': 'Snapshot Labs'
};

const tokenAbi = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)'
];

export async function getToken(token: string, chainId: number) {
  const provider = getProvider(chainId.toString());
  const multi = new Multicaller(chainId.toString(), provider, tokenAbi, {});
  multi.call('name', token, 'name');
  multi.call('symbol', token, 'symbol');
  multi.call('decimals', token, 'decimals');
  return await multi.execute();
}

export async function getAccount(
  account: string,
  token: string,
  chainId: number
) {
  const provider = getProvider(chainId.toString());
  const multi = new Multicaller(chainId.toString(), provider, tokenAbi, {});
  multi.call('balance', token, 'balanceOf', [account]);
  multi.call('allowance', token, 'allowance', [account, BOOST_ADDRESS]);
  return await multi.execute();
}

export async function approve(
  web3: Web3Provider,
  tokenAddress: string,
  amount: string
): Promise<any> {
  const signer = web3.getSigner();
  const token = new Contract(tokenAddress, tokenAbi, signer);
  return await token.approve(BOOST_ADDRESS, MaxUint256);
}
