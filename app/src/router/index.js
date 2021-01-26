
import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';

Vue.use(VueRouter);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function ({ store }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  });

  // TODO: Find a smoother solution when we fall back to check localstorage...
  Router.beforeEach((to, from, next) => {
    console.log('new ROUTE:', to);
    if (to.matched.some(record => record.meta.requiresAuth)) {
      console.log('this route requires authenticated user');
      const loggedIn = store.getters['authState/isLoggedIn'];
      if (loggedIn) {
        next();
        return;
      } else {
        store.dispatch('authState/initFromStorage');
        if (store.getters['authState/isLoggedIn']) {
          next();
          return;
        }
      }

      next('/login');
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
      console.log('this route requires admin authentication');
      const isAdmin = store.state.authState.isAdmin;
      console.log('isAdmin:', isAdmin);
      if (isAdmin) {
        next();
        return;
      } else {
        store.dispatch('authState/initFromStorage');
        if (store.state.authState.isAdmin) {
          next();
          return;
        }
      }
      next('/login/admin');
    } else {
      next();
    }
  });

  return Router;
}
