
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Start.vue') },
      { path: 'camera', component: () => import('pages/Camera.vue') },
      { path: 'watch', component: () => import('pages/Viewer.vue') },
      { path: 'test', component: () => import('pages/PeerVideoTest.vue') },
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
