import io from 'socket.io-client';

import VueSocketIOExt from 'vue-socket.io-extended';

// const socketUrl = 'http://localhost:3000';

let socketUrl = `${process.env.BACKEND_SERVER_PROTOCOL}://${process.env.BACKEND_SERVER}/`;
// if (process.env.SIGNALING_PORT) {
//   socketUrl = `${process.env.BACKEND_SERVER_PROTOCOL}://${process.env.BACKEND_SERVER}:${process.env.SIGNALING_PORT}/`;
// }
if (process.env.SIGNALING_SERVER) {
  socketUrl = process.env.SIGNALING_SERVER;
}

// socketUrl = `${window.location.origin}:${process.env.SIGNALING_PORT}`;
// socketUrl = 'https://inclubit-socket.loca.lt';

// socketUrl = `${window.location.origin}`;

console.log('socketUrl: ', socketUrl);

// Wanted to add it to the "Socket class" prototype but that doesn't work because it's not there at runtime

export const socket = io(socketUrl);
socket.request = function request (ev, ...data) {
  // console.log('socket request triggered');
  // console.log('data :>> ', data);
  return new Promise((resolve) => {
    socket.emit(ev, ...data, (response) => {
      // console.log('request acknowledged!!');
      resolve(response);
    });
    // if (data) {
    //   socket.emit(ev, ...data, resolve);
    // }
    // else {
    //   socket.emit(ev, resolve);
    // }
  });
};

export default async ({ app, router, store, Vue }) => {
  Vue.use(VueSocketIOExt, socket, { store });
};
