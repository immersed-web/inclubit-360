
export default {
  namespaced: true,
  state: {
    chosenVideoDeviceId: null,
    chosenAudioInDeviceId: null,
    chosenAudioOutDeviceId: null,
    availableMediaDevices: [],
  },
  getters: {
    availableVideoDevices (state) {
      return state.availableMediaDevices.filter(device => device.kind === 'videoinput');
    },
    availableAudioInDevices (state) {
      return state.availableMediaDevices.filter(device => device.kind === 'audioinput');
    },
    availableAudioOutDevices (state) {
      return state.availableMediaDevices.filter(device => device.kind === 'audiooutput');
    },
  },
  mutations: {
    /**
     * @param  {} state - the local state
     * @param  {Object} payload - a js object containing the ids for chosen devices
     * @param  {string} [payload.videoDeviceId] - id of video device
     * @param  {string} [payload.audioInDeviceId] - id of audio in device
     * @param  {string} [payload.audioOutDeviceId] - id of audio out device
     */
    setChosenDeviceIds (state, payload) {
      if (payload.videoDeviceId) { state.chosenVideoDeviceId = payload.videoDeviceId; }
      if (payload.audioInDeviceId) { state.chosenAudioInDeviceId = payload.audioInDeviceId; }
      if (payload.audioOutDeviceId) { state.chosenAudioOutDeviceId = payload.audioOutDeviceId; }
    },
    setChosenVideoDeviceId (state, id) {
      state.chosenVideoDeviceId = id;
    },
    setChosenAudioInDeviceId (state, id) {
      state.chosenAudioInDeviceId = id;
    },
    setChosenAudioOutDeviceId (state, id) {
      state.chosenAudioOutDeviceId = id;
    },
    setAvailableMediaDevices (state, payload) {
      state.availableMediaDevices = payload;
    },
  },
  actions: {
    // TODO: Check the saved deviceIds in storage exists in available-lists
    initializeChosenMediaDevices ({ commit, getters }) {
      let chosenDevices = localStorage.getItem('chosenDevices');
      if (chosenDevices) {
        chosenDevices = JSON.parse(chosenDevices);

        // Fallback to available alternatives if saved devices aren't available
        if (!getters.availableVideoDevices.find(dev => dev.deviceId === chosenDevices.videoDeviceId)) {
          chosenDevices.videoDeviceId = getters.availableVideoDevices[0].deviceId;
        }
        if (!getters.availableAudioInDevices.find(dev => dev.deviceId === chosenDevices.audioInDeviceId)) {
          chosenDevices.audioInDeviceId = getters.availableAudioInDevices[0].deviceId;
        }
        if (!getters.availableAudioOutDevices.find(dev => dev.deviceId === chosenDevices.audioOutDeviceId)) {
          chosenDevices.audioOutDeviceId = getters.availableAudioOutDevices[0].deviceId;
        }
      } else {
        chosenDevices = {
          videoDeviceId: getters.availableVideoDevices[0].deviceId,
          audioInDeviceId: getters.availableAudioInDevices[0].deviceId,
          audioOutDeviceId: getters.availableAudioOutDevices[0].deviceId,
        };
      }
      commit('setChosenDeviceIds', chosenDevices);
    },
    saveChosenDevicesToStorage ({ state }) {
      localStorage.setItem('chosenDevices', JSON.stringify({
        videoDeviceId: state.chosenVideoDeviceId,
        audioInDeviceId: state.chosenAudioInDeviceId,
        audioOutDeviceId: state.chosenAudioOutDeviceId,
      }));
    },
  },
};
