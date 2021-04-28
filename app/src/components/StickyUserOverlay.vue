<template>
  <q-page-sticky position="top-right" :offset="[20, 20]">
    Inloggad som: <span class="text-primary">{{ currentUser }}</span>
    <q-btn
      icon="logout"
      flat
      rounded
      class="q-ml-md"
      label="logga ut"
      @click="logout"
    />
  </q-page-sticky>
</template>

<script>
import { mapState } from 'vuex';
import { logout } from 'src/js/auth-utils';

export default {
  name: 'StickyUserOverlay',
  props: {
    route: {
      type: String,
      default: '/',
      required: false,
    },
  },
  data () {
    return {
      //
    };
  },
  computed: {
    ...mapState('authState', {
      currentUser: 'currentUser',
    }),
  },
  methods: {
    logout () {
      logout();
      this.$router.replace(this.route);
    },
  },
};
</script>

<style scoped lang="scss">
</style>
