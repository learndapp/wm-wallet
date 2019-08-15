
<template>
  <div class="icon" :style="`width:${size}rem`">
    <img v-if="symbol.split('|')[0]=='BTC'" src="../assets/coin/bitcoin.png" />
    <img v-if="symbol=='ETH'" src="../assets/coin/ethereum.png" />
    <img v-if="symbol=='WGT'" src="../assets/coin/w3cgroup.png" />
  </div>
</template>

<script>
export default {
  props: {
    symbol: { type: String },
    size: { type: String },
  },
  data() {
    return {};
  },
};
</script>
<style lang="scss" scoped>
.icon {
  display: inline-block;
  vertical-align: top;
  img {
    width: 100%;
  }
}
</style>
