import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Wallet from './views/Wallet.vue';
import Market from './views/Market.vue';
import Setting from './views/Setting.vue';
import About from './views/About.vue';
// import NotFound from './views/NotFound.vue';

Vue.use(Router);

const router = new Router({
  mode: 'hash',
  scrollBehavior() {
    return {
      x: 0,
      y: 0,
    };
  },
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: Wallet,
    },
    {
      path: '/market',
      name: 'market',
      component: Market,
    },
    {
      path: '/setting',
      name: 'setting',
      component: Setting,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/service',
      name: 'service',
      // lazy-loaded
      component: () => import('./views/Service.vue'),
    },
    {
      path: '/*',
      redirect: '/wallet',
    },
  ],
});

router.beforeEach((to, from, next) => {
  window.BeforePath2 = window.BeforePath;
  window.BeforePath = from.path;
  next();
});

export default router;
