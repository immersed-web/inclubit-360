import { socket } from 'src/boot/socket-io';

export default {
  namespaced: true,
  state: {
    roomName: 'defaultRoom',
    roomState: 'outside',
    roomError: '',
    roomMembers: [],
    socketConnectionState: '',
    socketId: undefined,
    // serverUrl: '',
    peerConnectionState: 'disconnected',
    turnCredentials: {
      username: process.env.TURN_USER,
      password: process.env.TURN_PASSWORD,
    },
  },
  getters: {
    isInRoom (state) {
      if (!state.roomMembers || state.roomMembers.length === 0) {
        return false;
      }
      return state.roomMembers.some(member => member.id === socket.id);
      // if (!state.roomMembers[socket.id]) {
      //   return false;
      // }
      // return state.roomMembers[socket.id];
    },
    roomIsPopulated (state, getters) {
      if (!getters.isInRoom) {
        return false;
      }
      if (state.roomMembers.length !== 2) {
        return false;
      }
      return true;
    },
    peerIsConnected (state) {
      return state.peerConnectionState === 'connected';
    },
  },
  mutations: {
    SOCKET_CONNECT (state) {
      state.socketId = socket.id;
      state.socketConnectionState = 'connected';
    },
    SOCKET_DISCONNECT (state) {
      state.socketId = undefined;
      state.socketConnectionState = 'disconnected';
    },
    SOCKET_ROOMFULL (state, payload) {
      state.roomState = 'full';
      state.roomError = payload;
    },
    setRoomName (state, payload) {
      state.roomName = payload;
    },
    setRoomMembers (state, room) {
      state.roomMembers = room;
    },
    setRoomState (state, roomState) {
      state.roomState = roomState.state;
      state.roomError = roomState.error;
    },
    // setServerUrl (state, payload) {
    //   state.serverUrl = payload;
    // },
    setPeerConnectionState (state, payload) {
      state.peerConnectionState = payload;
    },
    setTurnCredentials (state, creds) {
      state.turnCredentials = creds;
    },
  },
  actions: {
    socket_room ({ commit, state, getters, dispatch }, room) {
      dispatch('setRoom', room);
      // console.log('socket_room called with:', room);
      // commit('setRoomMembers', room);
      // if (getters.isInRoom) {
      //   state.roomState = 'inside';
      //   state.roomError = '';
      // }
    },
    setRoom ({ commit, state, getters }, room) {
      console.log('socket_room called with:', room);
      if (!Array.isArray(room)) {
        console.error('room MUST be an array!!!!');
        return;
      }
      commit('setRoomMembers', room);
      if (getters.isInRoom) {
        commit('setRoomState', { state: 'inside', error: '' });
        // state.roomState = 'inside';
        // state.roomError = '';
      } else {
        commit('setRoomState', { state: 'outside', error: '' });
      }
    },
    setSettingsFromStorage ({ commit, state }) {
      console.log('restoring from storage');
      const storageObj = localStorage.getItem('connectionSettings');
      if (storageObj) {
        const settings = JSON.parse(storageObj);
        if (settings.roomName) {
          commit('setRoomName', settings.roomName);
        }
        // if (settings.serverUrl) {
        //   commit('setServerUrl', settings.serverUrl);
        // }
      }
    },
    saveSettingsToStorage ({ state }) {
      localStorage.setItem('connectionSettings', JSON.stringify(state));
    },
  },
};
