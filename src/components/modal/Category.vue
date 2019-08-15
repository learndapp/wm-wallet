<template>
  <div class="modal-container">
    <div class="modal-header">
      <h5>
        资产列表
        <a
          @click.stop="$root.$emit('closeModal')"
          class="btn btn-clear float-right small-hide"
          aria-label="Close"
        ></a>
      </h5>
    </div>
    <div class="modal-body">
      <div v-for="item in coinList" :key="item.symbol">
          <div class="form-group">
          <label class="form-switch" @change="toggle(item.symbol)">
            <input type="checkbox" v-model="toggleMap[item.symbol]" checked="true"
              :disabled="['BTC','ETH'].indexOf(item.symbol)>-1" />
            <i class="form-icon"></i> {{item.name}}
            - <span v-html="item.desc"></span>
          </label>
        </div>
      </div>
      <!-- <a href="">置顶/取消 </a><a href="">上移</a><a href="">下移</a> -->
    </div>
    <div class="modal-footer">
      <!-- <button class="btn btn-primary" @click.stop="$root.$emit('closeModal')">完成</button> -->
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  props: {
    val: { type: Array },
  },
  data() {
    return {
      toggleMap: {},
      coinList: [],
    };
  },
  created() {
    //  读取map
    this.coinList = this.$root.coinList;
    //
    this.$store.state.hideCoin.forEach((symbol) => {
      this.toggleMap[symbol] = false;
    });
  },
  methods: {
    toggle(symbol) {
      const hideCoin = this.$store.state.hideCoin || [];
      if (this.toggleMap[symbol]) {
        // remove
        const index = hideCoin.indexOf(symbol);
        if (index > -1) {
          hideCoin.splice(index, 1);
        }
      } else {
        hideCoin.push(symbol);
      }
      this.setStateValue({
        k: 'hideCoin',
        v: hideCoin,
      });
    },
    ...mapMutations(['setStateValue']),
  },
};
</script>

<style scoped>

</style>
