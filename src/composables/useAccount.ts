import { useWeb3 } from '@/composables/useWeb3';

export function useAccount() {
  const { web3 } = useWeb3();
}
