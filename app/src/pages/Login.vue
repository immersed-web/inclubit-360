<template>
  <q-page id="login-container">
    <h3>{{ isAdminLogin? 'Login as Admin': 'Login' }}</h3>
    <q-form id="login-form" @submit="login">
      <q-input
        v-model="username"
        dense
        outlined
        bordered
        class="q-mb-xl"
        label="username"
      />
      <q-input
        v-model="password"
        dense
        outlined
        bordered
        class="q-mb-xl"
        label="password"
        type="password"
      />
      <q-btn color="primary" type="submit" label="login" />
    </q-form>
    <pre v-if="errorMsg"> {{ errorMsg }}</pre>
    <pre>
      {{ currentUser }}
    </pre>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'Login',
  props: {
    loginType: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      username: '',
      password: '',
      errorMsg: '',
    };
  },
  computed: {
    isAdminLogin () {
      return this.loginType === 'admin';
    },
    ...mapState('authState', {
      currentUser: 'currentUser',
    }),
  },
  methods: {
    ...mapActions('authState', {
      loginAdmin: 'loginAdmin',
      loginUser: 'loginUser',
    }),
    async login () {
      console.log('login', this.username, this.password);
      try {
        if (this.loginType === 'admin') {
          await this.loginAdmin({ username: this.username, password: this.password });
          this.$router.replace('/admin');
        } else {
          await this.loginUser({ username: this.username, password: this.password });
          this.$router.replace('/camera');
        }
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>

<style scoped lang="scss">
#login-container {
  display: grid;
  place-items: center;
}

#login-form {
  display: flex;
  flex-direction: column;
  // justify-content: right;
  // align-items: right;
}
</style>
