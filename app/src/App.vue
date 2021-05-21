<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
// import peerUtil from 'src/js/peer-utils';
export default {
  name: 'App',
  // async preFetch ({ store }) {
  // console.log('PREFETCH TRIGGERED');
  // It seems we are not allowed to enumerate mediadevices before requesting usermedia.
  // So there is no point trying to populate at this early stage
  // TODO: Can we find a way to make this work? So we can have mediadevices availabel on page load?
  // try {
  //   await peerUtil.populateAvailableMediaDevices();
  //   store.dispatch('deviceSettings/getChosenDevicesFromStorage');
  // } catch (err) {
  //   console.error('failed to populate available mediadevices');
  //   console.error(err);
  // }
  // },
  sockets: {
    // room (members) {
    //   console.log('updating room members in store');
    //   this.$store.commit('connectionSettings/setRoomMembers', members);
    // },
  },
  // async beforeCreate () {
  // },
  created () {
    this.restoreConnectionSettings();
  },
  methods: {
    ...mapActions('connectionSettings', {
      restoreConnectionSettings: 'setSettingsFromStorage',
    }),
  },
};
</script>
