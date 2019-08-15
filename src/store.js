import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

let wm = {
  isWx: false,
  sid: '',
  email: '',
  cache: {},
  walletMap: {},
  importWallet: {},
  hideCoin: [],
};
const WM = window.localStorage.getItem('WM');
if (WM && WM !== 'undefined') {
  wm = JSON.parse(WM);
}

const localStoragePlugin = (store) => {
  store.subscribe((mutation, {
    isWx, sid, email, cache, walletMap, importWallet, hideCoin,
  }) => {
    window.localStorage.setItem(
      'WM',
      JSON.stringify({
        isWx,
        sid,
        email,
        cache,
        walletMap,
        importWallet,
        hideCoin,
      }),
    );
  });
};

export default new Vuex.Store({
  state: wm,
  mutations: {
    setStateValue(state, { k, v }) {
      state[k] = v;
    },
  },
  plugins: [localStoragePlugin],
});
