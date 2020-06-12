
// import VueSocketIO from 'vue-socket.io';

// // "async" is optional;
// // more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
// export default async ({ app, router, store, Vue }) => {
//   // something to do
//   Vue.use(new VueSocketIO({
//     debug: true,
//     connection: 'http://localhost:3000',
//     vuex: {
//       store,
//       actionPrefix: 'SOCKET_',
//       mutationPrefix: 'SOCKET_',
//     },
//     // options: { path: "/my-app/" } //Optional options
//   }));
// };

import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

const socket = io('http://localhost:3000');

export default async ({ app, router, store, Vue }) => {
  Vue.use(VueSocketIOExt, socket, { store });
};
