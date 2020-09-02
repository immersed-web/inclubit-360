
export default {
  namespaced: false,
  state: {
    roomName: 'defaultRoom',
    serverUrl: '',
  },
  getters: {
  },
  mutations: {
    setRoomName (state, payload) {
      state.roomName = payload;
    },
    setServerUrl (state, payload) {
      state.serverUrl = payload;
    },
  },
  actions: {
  },
};
