import Vue from 'vue';

import Topbar from './Topbar.vue';
import SvgIcon from './SvgIcon.vue';
import CoinIcon from './CoinIcon.vue';
import AllModal from './modal/AllModal.vue';

const components = {
  Topbar,
  SvgIcon,
  CoinIcon,
  AllModal,
};
Object.keys(components).forEach((key) => {
  Vue.component(key, components[key]);
});
