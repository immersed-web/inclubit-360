import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

// const socket = io('http://localhost:3000');
const socket = io('http://192.168.1.207:3000');

export default async ({ app, router, store, Vue }) => {
  Vue.use(VueSocketIOExt, socket, { store });
};
