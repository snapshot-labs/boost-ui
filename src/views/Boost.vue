<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { _t, _n } from '@/helpers/utils';
import { claimTokens } from '@snapshot-labs/boost';
import { formatUnits } from '@ethersproject/units';
import api, { BOOST_QUERY, STATUS_QUERY } from '@/helpers/api';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';
import networks from '@/helpers/networks.json';

const route = useRoute();
const { web3Account, web3 } = useWeb3();
const { pendingCount } = useTxStatus();

const id = parseInt(route.params.id as string);

const loading = ref<boolean>(false);
const loaded = ref<boolean>(false);
const boost = ref<any>({});
const token = ref<any>({});
const strategy = ref<any>({});

const statusLoading = ref<boolean>(false);
const statusLoaded = ref<boolean>(false);
const status = ref<any>({});

const claimLoading = ref<boolean>(false);
const claimLoaded = ref<boolean>(false);

const auth = getInstance();

onMounted(async () => {
  // Load boost
  loading.value = true;
  const chainId = 5;
  const { data } = await api.query({
    query: BOOST_QUERY,
    variables: { id, chainId }
  });
  boost.value = data.boost;
  loading.value = false;
  loaded.value = true;

  // Check status
  await updateStatus();
});

watch(web3Account, (next, prev) => {
  if (next !== prev) updateStatus();
});

async function updateStatus() {
  if (!web3Account.value) return;

  statusLoading.value = true;
  const { data } = await api.query({
    query: STATUS_QUERY,
    variables: {
      boostId: id,
      recipient: web3Account.value,
      chainId: 5
    }
  });
  status.value = data.status;
  statusLoading.value = false;
  statusLoaded.value = true;
  console.log('Status', data.status);
}

async function handleClaim() {
  // Claim tokens
  claimLoading.value = true;
  const tx = await claimTokens(
    auth.web3,
    id,
    web3Account.value,
    status.value.amount,
    status.value.sig
  );

  pendingCount.value++;
  const receipt = await tx.wait(1);
  console.log('Receipt', receipt);
  claimLoading.value = false;
  claimLoaded.value = true;
  pendingCount.value--;
}
</script>
<template>
  <div>
    <Container class="py-5 s-box !max-w-[640px]">
      <UiLoading v-if="loading" />
      <div v-if="loaded" class="space-y-6">
        <div class="x-block p-4 text-center">
          <UiLoading v-if="statusLoading" />
          <template v-else>
            <div v-if="status.amount !== '0'">
              <div>You are eligible to claim</div>
              <h2 class="mb-3">
                {{ _n(formatUnits(status.amount, boost.token.decimals)) }}
                {{ boost.token.symbol }} 🎉
              </h2>
              <UiBtn :loading="claimLoading" @click="handleClaim">Claim</UiBtn>
            </div>
            <div v-else>
              <div class="mb-3">You are not eligible 😔</div>
              <UiBtn
                class="!border-skin-link border-[1px] !bg-skin-bg !text-skin-link"
                @click="updateStatus"
                >Try again</UiBtn
              >
            </div>
          </template>
        </div>
        <div>
          <h4 class="eyebrow mb-2">
            <IH-sparkles class="inline-block" />
            Strategy
          </h4>
          <div class="x-block">
            <div class="px-4 py-3 border-b">
              <IH-chevron-down class="inline-block mr-2" /> Vote on the proposal
              <a
                :href="`https://snapshot.org/#/proposal/${boost.strategy.params.proposal}`"
                target="_blank"
              >
                snapshot://{{ boost.strategy.params.proposal.slice(0, 7) }}...
              </a>
            </div>
            <div class="px-4 py-3">
              <IH-chevron-up class="inline-block mr-2" />
              Claim a fixed amount of
              <b>
                {{
                  formatUnits(
                    boost.strategy.params.amount,
                    boost.token.decimals
                  )
                }}
                {{ boost.token.symbol }}
              </b>
            </div>
          </div>
        </div>
        <div>
          <h4 class="eyebrow mb-2">
            <IH-fire class="inline-block" />
            Boost
          </h4>
          <div class="x-block py-2 px-4">
            <div class="py-2">
              <div class="w-1/6 inline-block text-right mr-3">Balance</div>
              <b>
                {{ _n(formatUnits(boost.balance, boost.token.decimals)) }}
                {{ boost.token.symbol }}
              </b>
            </div>
            <div class="py-2">
              <div class="w-1/6 inline-block text-right mr-3">Network</div>
              <Stamp
                id="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
                type="token"
                class="mr-2"
              />
              <b>{{ networks[boost.chainId].name }}</b>
            </div>
            <div class="py-2">
              <div class="w-1/6 inline-block text-right mr-3">Owner</div>
              <b>{{ boost.owner }}</b>
            </div>
            <div class="py-2">
              <div class="w-1/6 inline-block text-right mr-3">Guard</div>
              <b>{{ boost.guard }}</b>
            </div>
            <div class="py-2">
              <div class="w-1/6 inline-block text-right mr-3">Start</div>
              <b>{{ _t(boost.start) }}</b>
            </div>
            <div class="py-2">
              <div class="w-1/6 inline-block text-right mr-3">End</div>
              <b>{{ _t(boost.end) }}</b>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </div>
</template>
