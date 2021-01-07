<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import peerUtil from 'src/js/peer-utils';
export default {
  name: 'App',
  async preFetch ({ store }) {
    console.log('PREFETCH TRIGGERED');
    // initialize something in store here
    await peerUtil.populateAvailableMediaDevices();
    return store.dispatch('deviceSettings/getChosenDevicesFromStorage');
  },
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
