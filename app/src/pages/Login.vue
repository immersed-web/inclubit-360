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
      <q-banner rounded class="bg-negative q-mt-md" :class="{invisible: !errorMsg}" dense>
        {{ errorMsg }}
      </q-banner>
    </q-form>
    <!-- <pre>
      {{ currentUser }}
    </pre> -->
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
    target: {
      type: String,
      required: false,
      default: '/',
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
      canCreateRooms: 'canCreateRooms',
    }),
  },
  watch: {
    username () {
      this.errorMsg = '';
    },
    password () {
      this.errorMsg = '';
    },
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
          if (!this.canCreateRooms) {
            console.log('not allowed to create room. redirecting to root');
            this.$router.replace('/');
          } else {
            console.log('redirecting to target:', this.target);
            this.$router.replace(this.target);
          }
        }
      } catch (err) {
        console.error({ err });
        this.errorMsg = err.response.data ? err.response.data : err.response.statusText;
      }
    },
  },
};
</script>

<style scoped lang="scss">
#login-container {
  display: grid;
  // grid-template-rows: 1fr 3fr;
  place-items: center;
}

#login-form {
  align-self: start;
  display: flex;
  flex-direction: column;
  // justify-content: right;
  // align-items: right;
}
</style>
