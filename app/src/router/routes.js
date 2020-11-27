
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Start.vue') },
      { name: 'Camera View', path: 'camera', component: () => import('pages/Camera.vue') },
      { name: 'Watcher View', path: 'watch', component: () => import('pages/Viewer.vue') },
      { path: 'test', component: () => import('pages/PeerVideoTest.vue') },
      { path: 'aframe', component: () => import('pages/AframeTest.vue') },
      { path: 'settings', component: () => import('pages/Settings.vue') },
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  });
}

export default routes;
