<template>
  <q-page padding>
    <h3>Befintliga Användare:</h3>
    <q-list bordered separator>
      <q-item v-for="(password, username) in users" :key="username" bordered>
        <q-item-section>{{ username }}: {{ password }}</q-item-section>
        <q-item-section side>
          <q-btn round flat icon="clear" @click="deleteUser(username)" />
        </q-item-section>
      </q-item>
    </q-list>
    <h3>Skapa ny användare:</h3>
    <q-form @submit="addUser">
      <q-input
        v-model="newUser.username"
        dense
        outlined
        bordered
        label="username"
        :rules="[ val => val && val.length > 0 || 'Inte tom, plzzz!']"
      />
      <q-input
        v-model="newUser.password"
        dense
        outlined
        bordered
        label="password"
        :rules="[ val => val && val.length > 0 || 'Inte tom, plzzz!']"
      />
      <q-btn color="primary" type="submit" label="lägg till" />
    </q-form>
  </q-page>
</template>

<script>
import { get, post } from 'src/js/auth-utils';
export default {
  name: 'Admin',
  data () {
    return {
      newUser: {
        username: '',
        password: '',
      },
      users: {
      },
    };
  },
  async created () {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers () {
      const response = await get('/admin/get-users');
      console.log(response.data);
      this.users = response.data;
    },
    async addUser () {
      const userData = {};
      userData[this.newUser.username] = this.newUser.password;
      console.log('user to add', userData);
      await post('/admin/add-users', userData);
      await this.fetchUsers();
    },
    async deleteUser (username) {
      await post('/admin/delete-users', [username]);
      await this.fetchUsers();
      console.log('user to delete', username);
    },
  },
};
</script>

<style scoped lang="scss">
</style>
