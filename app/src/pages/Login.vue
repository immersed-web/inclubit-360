<template>
  <q-page id="login-container">
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
  </q-page>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    login () {
      console.log('login', this.username, this.password);
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
