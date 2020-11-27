<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'App',
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
