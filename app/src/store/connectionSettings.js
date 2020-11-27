
export default {
  namespaced: true,
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
