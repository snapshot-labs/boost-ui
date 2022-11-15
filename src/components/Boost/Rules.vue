<script setup lang="ts">
import { _t, explorerUrl, shortenAddress } from '@/helpers/utils';
import { GUARDS } from '@/helpers/token';

const props = defineProps<{
  owner: string;
  guard: string;
  start: number;
  end: number;
}>();
</script>

<template>
  <div>
    The strategy is enforced by the guard
    <a :href="explorerUrl(5, guard)" target="_blank"
      ><b>{{ GUARDS[guard] ? GUARDS[guard] : shortenAddress(guard) }}</b></a
    >. The boost expires on <b>{{ _t(end, 'MMM D, YYYY') }}</b
    >, after this date the owner of the boost
    <a :href="explorerUrl(5, owner)" target="_blank"
      ><b>{{ shortenAddress(owner) }}</b></a
    >
    can claim back what is left from the deposit.
  </div>
</template>
