
export default {
  namespaced: false,
  state: {
    activeVideoDeviceId: null,
    activeAudioInputDeviceId: null,
    activeAudioOutputDeviceId: null,
    availableMediaDevices: [],
  },
  getters: {
    availableVideoInputDevices (state) {
      return state.availableMediaDevices.filter(device => device.kind === 'videoinput');
    },
    availableAudioInputDevices (state) {
      return state.availableMediaDevices.filter(device => device.kind === 'audioinput');
    },
    availableAudioOutputDevices (state) {
      return state.availableMediaDevices.filter(device => device.kind === 'audiooutput');
    },
  },
  mutations: {
    setAllActiveMediaDeviceIds (state, payload) {
      if (payload.activeVideoDeviceId) { state.activeVideoDeviceId = payload.activeVideoDeviceId; }
      if (payload.activeAudioInputDeviceId) { state.activeAudioInputDeviceId = payload.activeAudioInputDeviceId; }
      if (payload.activeAudioOutputDeviceId) { state.activeAudioOutputDeviceId = payload.activeAudioOutputDeviceId; }
    },
    setAvailableMediaDevices (state, payload) {
      state.availableMediaDevices = payload;
    },
  },
  actions: {
    initializeActiveMediaDevices ({ commit, getters }) {
      const activeMediaObject = {
        activeVideoDeviceId: getters.availableVideoInputDevices[0].deviceId,
        activeAudioInputDeviceId: getters.availableAudioInputDevices[0].deviceId,
        activeAudioOutputDeviceId: getters.availableAudioOutputDevices[0].deviceId,
      };
      commit('setAllActiveMediaDeviceIds', activeMediaObject);
    },
  },
};
