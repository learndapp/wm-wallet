import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
import Toasted from 'vue-toasted';
import App from './App.vue';
import router from './router';
import store from './store';
// import './registerServiceWorker';

// global component
import './components/index';

Vue.use(VueClipboard);
Vue.use(Toasted, {
  theme: 'toasted-primary',
  position: 'bottom-right',
  duration: 2000,
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
