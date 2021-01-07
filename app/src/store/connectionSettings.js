import { socket } from 'src/boot/socket-io';

export default {
  namespaced: true,
  state: {
    roomName: 'defaultRoom',
    roomMembers: [],
    serverUrl: '',
    // socketConnectionState: '',
    peerConnectionState: 'disconnected',
  },
  getters: {
    isInRoom (state) {
      if (!state.roomMembers[socket.id]) {
        return false;
      }
      return state.roomMembers[socket.id];
    },
    roomIsPopulated (state, getters) {
      if (!getters.isInRoom) {
        return false;
      }
      if (Object.keys(state.roomMembers).length !== 2) {
        return false;
      }
      return true;
    },
  },
  mutations: {
    setRoomName (state, payload) {
      state.roomName = payload;
    },
    SOCKET_ROOM (state, payload) {
      state.roomMembers = payload;
    },
    setServerUrl (state, payload) {
      state.serverUrl = payload;
    },
    setPeerConnectionState (state, payload) {
      state.peerConnectionState = payload;
    },
  },
  actions: {
    setSettingsFromStorage ({ commit, state }) {
      console.log('restoring from storage');
      const storageObj = localStorage.getItem('connectionSettings');
      if (storageObj) {
        const settings = JSON.parse(storageObj);
        if (settings.roomName) {
          commit('setRoomName', settings.roomName);
        }
        if (settings.serverUrl) {
          commit('setServerUrl', settings.serverUrl);
        }
      }
    },
    saveSettingsToStorage ({ state }) {
      localStorage.setItem('connectionSettings', JSON.stringify(state));
    },
  },
};
