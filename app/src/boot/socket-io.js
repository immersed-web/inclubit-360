import io from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

// const socketUrl = 'http://localhost:3000';

let socketUrl = `${process.env.BACKEND_SERVER_PROTOCOL}://${process.env.BACKEND_SERVER}/`;
if (process.env.SIGNALING_PORT) {
  socketUrl = `${process.env.BACKEND_SERVER_PROTOCOL}://${process.env.BACKEND_SERVER}:${process.env.SIGNALING_PORT}/`
}

console.log('socketUrl: ', socketUrl);

const socket = io(socketUrl);

export default async ({ app, router, store, Vue }) => {
  Vue.use(VueSocketIOExt, socket, { store });
};
