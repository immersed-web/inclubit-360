
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

  store.dispatch('authState/initFromStorage');

  Router.beforeEach((to, from, next) => {
    console.log('new ROUTE:', to);

    // // Make sure store is loaded
    // if (to.matched.some(record => { return record.meta.requiresUser || record.meta.requiresRoomCreator || record.meta.requiresAdmin; })) {
    //   // console.log('prechecking authStore');
    //   const loggedIn = store.getters['authState/isLoggedIn'];
    //   if (!loggedIn) {
    //     console.log('(re?)initializing authStore from storage');
    //     store.dispatch('authState/initFromStorage');
    //   }
    // }
    // console.log('store check done');

    const redirectRoute = { name: 'login', params: { target: to.path } };

    if (to.matched.some(record => record.meta.requiresUser)) {
      console.log('this route requires authenticated user');
      const loggedIn = store.getters['authState/isLoggedIn'];
      if (loggedIn) {
        console.log('logged in. Letting through');
        next();
        return;
      }
      console.log('redirecting to:', redirectRoute);
      next(redirectRoute);
    } else if (to.matched.some(record => record.meta.requiresRoomCreator)) {
      console.log('this route requires authenticated room creator');
      const loggedIn = store.getters['authState/isLoggedIn'];
      const canCreateRooms = store.state.authState.canCreateRooms;
      if (loggedIn && canCreateRooms) {
        console.log('logged in. Letting through');
        next();
        return;
      }
      console.log('redirecting to:', redirectRoute);
      next(redirectRoute);
    } else if (to.matched.some(record => record.meta.requiresAdmin)) {
      console.log('this route requires admin authentication');
      const isAdmin = store.state.authState.isAdmin;
      console.log('isAdmin:', isAdmin);
      if (isAdmin) {
        next();
        return;
      }
      redirectRoute.name = 'adminLogin';
      console.log('redirecting to:', redirectRoute);
      next(redirectRoute);
    } else {
      next();
    }
  });

  return Router;
}
