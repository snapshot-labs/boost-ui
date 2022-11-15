<template>
  <div>
    <Container class="py-5 s-box !max-w-[640px]">
      <div class="text-center py-6">
        <h1 class="text-[36px]">Programmable distribution</h1>
        <p>Define strategy to rewards your users</p>
      </div>
      <div class="text-center">
        <router-link
          :to="{
            name: 'create',
            params: {
              strategy: 'snapshot',
              id: '0x0021dc765768342d269184cb46e1cf17e6609559973d88bd01a292a4f390caa4'
            }
          }"
        >
          Boost a proposal
        </router-link>
      </div>
    </Container>
  </div>
</template>
