<template>
  <div>
    <div class="modal" :class="{active: showModal}" v-if="showModal">
      <a
        @click.stop="showModal = false"
        class="modal-overlay"
        aria-label="Close"
      ></a>
      <WalletReceive v-if="mod == 'walletReceive'" :val="val" />
      <WalletSend v-else-if="mod == 'walletSend'" :val="val" />
      <CreateWallet v-else-if="mod == 'createWallet'" :val="val" />
      <ChooseWallet v-else-if="mod == 'chooseWallet'" :val="val" />
      <ImportWallet v-else-if="mod == 'importWallet'" :val="val" />
      <ExportWallet v-else-if="mod == 'exportWallet'" :val="val" />
      <EmailBackup v-else-if="mod == 'emailBackup'" :val="val" />
      <Category v-else-if="mod == 'category'" :val="val" />
      <Reset v-else-if="mod == 'reset'" :val="val" />
    </div>
  </div>
</template>

<script>
import WalletReceive from '@/components/modal/WalletReceive.vue';
import WalletSend from '@/components/modal/WalletSend.vue';
import CreateWallet from '@/components/modal/CreateWallet.vue';
import ChooseWallet from '@/components/modal/ChooseWallet.vue';
import ImportWallet from '@/components/modal/ImportWallet.vue';
import ExportWallet from '@/components/modal/ExportWallet.vue';
import EmailBackup from '@/components/modal/EmailBackup.vue';
import Category from '@/components/modal/Category.vue';
import Reset from '@/components/modal/Reset.vue';

export default {
  data() {
    return {
      showModal: false,
      mod: '',
      val: [],
      closeModalCallback: null,
      doneStatus: false,
    };
  },
  created() {},
  mounted() {
    //
    this.$root.$on('showModal', (params, cb) => {
      const { mod, val } = params;
      this.mod = mod;
      this.val = val;
      this.showModal = true;
      if (cb) {
        this.closeModalCallback = cb;
      }
    });
    //
    this.$root.$on('closeModal', (flag) => {
      this.doneStatus = flag === true;
      this.showModal = false;
    });
  },
  components: {
    WalletReceive,
    WalletSend,
    CreateWallet,
    ChooseWallet,
    ImportWallet,
    ExportWallet,
    EmailBackup,
    Category,
    Reset,
  },
};
</script>

<style lang="scss" scoped>
.modal-body {
  span {
    display: inline-block;
    vertical-align: top;
  }
}
</style>
