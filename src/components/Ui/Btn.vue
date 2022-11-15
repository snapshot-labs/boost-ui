<script setup lang="ts">
defineProps({
  disabled: Boolean,
  loading: Boolean
});
</script>

<template>
  <button
    :disabled="disabled || loading"
    type="button"
    class="bg-skin-link w-full text-skin-bg p-2 rounded-lg disabled:bg-skin-text"
  >
    <UiLoading v-if="loading" class="rev" />
    <slot v-else />
  </button>
</template>
