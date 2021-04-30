
const routes = [
  {
    path: '/',
    meta: { requiresUser: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Start.vue') },
      { name: 'Watcher View', meta: { label: 'Åskådarsidan' }, path: 'watch', component: () => import('pages/Viewer.vue') },
    ],
  },
  {
    path: '/',
    meta: { requiresRoomCreator: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'camera', component: () => import('pages/Start.vue'), props: { isCamera: true } },
      { path: 'kamera', redirect: 'camera' },
      { name: 'Camera View', meta: { label: 'Sändarsidan' }, path: 'camera/send', component: () => import('pages/Camera.vue') },
    ],
  },
  {
    path: '/admin',
    meta: { requiresAdmin: true },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Admin.vue') },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'login',
        path: 'login/',
        component: () => import('pages/Login.vue'),
        props: route => { if (route.params.target) { return { target: route.params.target }; } else return {}; },
      },
      {
        name: 'adminLogin',
        path: 'admin/login',
        component: () => import('pages/Login.vue'),
        props: route => { return { loginType: 'admin' }; },
      },
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
