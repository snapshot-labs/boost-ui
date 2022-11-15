<script setup lang="ts">
// DAI 0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60
import { computed, onMounted, ref, watch } from 'vue';
import { isAddress } from '@ethersproject/address';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { useRoute, useRouter } from 'vue-router';
import { BigNumber } from '@ethersproject/bignumber';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { pin } from '@snapshot-labs/pineapple';
import { createBoost } from '@snapshot-labs/boost';
import { _n, _t } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';
import {
  getToken,
  getAccount,
  approve,
  SNAPSHOT_GUARD_ADDRESS
} from '@/helpers/token';
import snapshot, { PROPOSAL_QUERY } from '@/helpers/snapshot';

const route = useRoute();
const router = useRouter();
const { pendingCount } = useTxStatus();
const { web3Account, web3 } = useWeb3();

const id = route.params.id as string;

const loading = ref<boolean>(false);
const loaded = ref<boolean>(false);

const approveLoading = ref<boolean>(false);
const createLoading = ref<boolean>(false);

const proposal = ref<any>({});
const account = ref<any>({});
const tokenAddress = ref<string>('');
const token = ref<any>({});
const type = ref<string>('fixed');
const amount = ref<number>();
const amountPerVoter = ref<number>();

const amountUnit = computed(() =>
  parseUnits((amount.value || 0).toString(), token.value.decimals)
);

const requireApproval = computed(() =>
  BigNumber.from(account.value.allowance || '0').lt(
    BigNumber.from(amountUnit.value || '0')
  )
);

const formIsValid = computed(
  () => amount.value && amountPerVoter.value && token.value
);

const auth = getInstance();

watch([web3Account, tokenAddress], () => updateAccount());

async function updateAccount() {
  account.value = {};
  if (web3Account.value && tokenAddress.value)
    account.value = await getAccount(web3Account.value, tokenAddress.value, 5);
}

watch(tokenAddress, async () => {
  token.value = {};
  if (tokenAddress.value && isAddress(tokenAddress.value))
    token.value = await getToken(tokenAddress.value, 5);
});

onMounted(async () => {
  loading.value = true;
  console.log('Get proposal', id);
  const { data } = await snapshot.query({
    query: PROPOSAL_QUERY,
    variables: { id }
  });
  proposal.value = data.proposal;
  loading.value = false;
  loaded.value = true;
});

function handleMax() {
  if (account.value.balance)
    amount.value = parseFloat(
      formatUnits(account.value.balance, token.value.decimals)
    );
}

async function handleApproval() {
  approveLoading.value = true;
  const tx = await approve(
    auth.web3,
    tokenAddress.value,
    amountUnit.value.toString()
  );

  pendingCount.value++;
  const receipt = await tx.wait(1);
  console.log('Receipt', receipt);
  pendingCount.value--;

  await updateAccount();
  approveLoading.value = false;
}

async function handleCreate() {
  createLoading.value = true;

  const strategy = {
    strategy: 'snapshot',
    params: {
      proposal: proposal.value.id,
      type: type.value,
      amount: parseUnits(
        (amountPerVoter.value || 0).toString(),
        token.value.decimals
      ).toString()
    }
  };

  try {
    // Pin strategy on IPFS
    const { cid } = await pin(strategy);
    const strategyURI = `ipfs://${cid}`;
    console.log('Strategy URI', strategyURI);

    // Create boost
    const tx = await createBoost(
      auth.web3,
      strategyURI,
      tokenAddress.value,
      amountUnit.value.toString(),
      SNAPSHOT_GUARD_ADDRESS,
      proposal.value.start,
      proposal.value.end + 60 * 60 * 24 * 3,
      web3Account.value
    );

    // Wait confirmation
    pendingCount.value++;
    const receipt = await tx.wait(1);
    console.log('Receipt', receipt);
    createLoading.value = false;
    pendingCount.value--;

    // Redirect to boost
    router.push({ name: 'boost', params: { id: 1 } });
  } catch (e) {
    console.log(e);
    pendingCount.value--;
  }
}
</script>
<template>
  <div>
    <Container class="py-5 s-box !max-w-[640px]">
      <div class="mb-6">
        <h3 class="mb-3">Boost the proposal</h3>
        <UiLoading v-if="loading" />
        <a
          v-if="proposal.link"
          :href="proposal.link"
          target="_blank"
          class="x-block py-3 px-4 !flex items-center"
        >
          <div class="block pr-3">
            <img src="~@/assets/snapshot.svg" class="w-[28px] h-[28px] block" />
          </div>
          <h4 class="leading-6">
            {{ proposal.title }}
          </h4>
          <div class="block pl-3">
            <IH-external-link />
          </div>
        </a>
      </div>
      <div v-if="proposal.link" class="space-y-6">
        <div>
          <h4 class="eyebrow mb-2">
            <IH-cash class="inline-block" />
            Deposit
          </h4>
          <div class="columns-2">
            <SIString
              v-model="tokenAddress"
              :definition="{
                type: 'uint256',
                title: 'Token address',
                examples: ['0xdc31...']
              }"
            />
            <div class="relative">
              <SIString
                v-model="amount"
                :definition="{
                  type: 'uint256',
                  title: `Amount ${token.symbol || ''}`,
                  examples: ['0']
                }"
              />
              <a
                v-if="account.balance"
                class="absolute right-[16px] top-[4px]"
                @click="handleMax"
                v-text="'max'"
              />
            </div>
          </div>
        </div>
        <div>
          <h4 class="eyebrow mb-2">
            <IH-sparkles class="inline-block" />
            Strategy
          </h4>
          <div class="mb-2">
            The deposit will be claimable by the voters of the Snapshot proposal
            <a
              href="https://snapshot.org/#/safe.eth/proposal/0x1b48a83c44e323275a605b244a05bde89918fb9ec86be7bb83792eb26e544441"
              target="_blank"
            >
              snapshot://safe.eth/0x1b48a83...</a
            >
            once it closes. The amount a voter can claim is:
          </div>
          <div class="columns-2 mb-3">
            <a
              :class="{ 'border-skin-link': type === 'fixed' }"
              class="x-block p-3 text-skin-link"
              @click="type = 'fixed'"
            >
              <IH-scale class="inline-block mr-1" />
              A fixed amount
            </a>
            <a
              :class="{ 'border-skin-link': type === 'ratio' }"
              class="x-block p-3 text-skin-link"
              @click="type = 'ratio'"
            >
              <IH-chart-square-bar class="inline-block mr-1" />
              Based on voting power
            </a>
          </div>
          <div v-if="type === 'ratio'">
            <SIString
              v-model="amountPerVoter"
              :definition="{
                type: 'uint256',
                title: 'Amount per 1 voting power',
                examples: ['0']
              }"
            />
            <div v-if="amount > 0 && amountPerVoter > 0" class="-mt-2">
              A voter with <b>100</b> voting power can claim
              <b>{{ _n(amountPerVoter * 100) }} {{ token.symbol }}</b>
            </div>
          </div>
          <div v-else>
            <SIString
              v-model="amountPerVoter"
              :definition="{
                type: 'uint256',
                title: 'Amount per voter',
                examples: ['0']
              }"
            />
            <div v-if="amount > 0 && amountPerVoter > 0" class="-mt-2">
              <b>{{ _n(Math.floor(amount / amountPerVoter)) }}</b> voters can
              claim <b>{{ amountPerVoter }} {{ token.symbol }}</b>
            </div>
          </div>
        </div>
        <div>
          <h4 class="eyebrow mb-2">
            <IH-clipboard-list class="inline-block" />
            Rules
          </h4>
          <BoostRules
            :owner="web3Account"
            :guard="SNAPSHOT_GUARD_ADDRESS"
            :start="proposal.end"
            :end="proposal.end + 60 * 60 * 24 * 3"
          />
        </div>
        <UiBtn v-if="!web3Account"> Connect wallet </UiBtn>
        <UiBtn
          v-else-if="token && amount && amountPerVoter && requireApproval"
          :loading="approveLoading"
          @click="handleApproval"
        >
          Approve spending {{ token.symbol }}
        </UiBtn>
        <UiBtn
          v-else
          :disabled="!formIsValid"
          :loading="createLoading"
          @click="handleCreate"
        >
          Boost
        </UiBtn>
      </div>
    </Container>
  </div>
</template>
