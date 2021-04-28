<template>
  <q-page padding class="row justify-center no-wrap">
    <div id="main-container">
      <h4>Befintliga Användare:</h4>
      <q-list bordered separator>
        <q-item class="bg-primary">
          <q-item-section><h6>Namn</h6></q-item-section>
          <q-item-section>
            <h6>Lösenord</h6>
          </q-item-section>
          <q-item-section>
            <h6>Får skapa rum</h6>
          </q-item-section>
          <q-item-section v-for="n in 3" :key="n" class="invisible" side>
            <q-btn round flat disable />
          </q-item-section>
        </q-item>
        <template v-for="(data, username) in users">
          <form v-if="editedUsername == username" :key="username" @submit.prevent="updateUser(editedUser)">
            <q-item>
              <!-- <q-item-section><q-input v-model="editedUser.username" outlined dense /></q-item-section> -->

              <q-item-section>{{ username }}</q-item-section>
              <q-item-section><q-input v-model="editedUser.password" outlined dense /></q-item-section>
              <q-item-section><q-checkbox v-model="editedUser.canCreateRooms" /></q-item-section>
              <q-item-section side>
                <q-btn icon="save" round flat type="submit">
                  <q-tooltip>Spara ändringar</q-tooltip>
                </q-btn>
              </q-item-section>
              <q-item-section side>
                <q-btn icon="cancel" round flat @click="stopEditUser">
                  <q-tooltip>Avbryt redigering</q-tooltip>
                </q-btn>
              </q-item-section>
              <q-item-section side class="invisible">
                <q-btn round flat disable />
              </q-item-section>
            </q-item>
          </form>
          <q-item v-else :key="username">
            <q-item-section>{{ username }}</q-item-section>
            <q-item-section>{{ data.password }} </q-item-section>
            <q-item-section><q-checkbox :value="data.canCreateRooms" disable /></q-item-section>

            <q-item-section side class="invisible">
              <q-btn round flat disable />
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="edit"
                color="secondary"
                flat
                round
                @click="startEditUser(username)"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn
                round
                flat
                color="negative"
                icon="delete"
                @click="deleteUser(username)"
              >
                <q-tooltip>Ta bort den här användaren</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
      <h4 class="q-mt-xl">
        Skapa ny användare:
      </h4>
      <q-form id="create-form" @submit="addUser">
        <q-input
          v-model="newUser.username"
          dense
          outlined
          bordered
          label="användarnamn"
          :rules="[ val => val && val.length > 0 || 'Inte tom, plzzz!']"
        />
        <q-input
          v-model="newUser.password"
          dense
          outlined
          bordered
          label="lösenord"
          :rules="[ val => val && val.length > 0 || 'Inte tom, plzzz!']"
        />
        <q-banner v-if="error" rounded class="q-mb-md bg-negative text-white">
          {{ error }}. Response: <span class="text-caption">{{ errorDetails }}</span>
        </q-banner>
        <div class="row no-wrap justify-between">
          <q-checkbox v-model="newUser.canCreateRooms" label="Får skapa rum">
            <q-tooltip>
              Om användaren får skapa rum. Alltså den sidan som skickar kameraströmmen.
            </q-tooltip>
          </q-checkbox>
          <q-btn no-caps color="primary" type="submit" label="Lägg till" />
        </div>
      </q-form>
    </div>
    <!-- <q-page-sticky position="top-right" :offset="[20, 20]">
      <q-btn icon="logout" flat label="logga ut" @click="logoutAdmin" />
    </q-page-sticky> -->
    <sticky-user-overlay :route="'/admin/login'" />
  </q-page>
</template>

<script>
import { getAdmin, postAdmin } from 'src/js/auth-utils';
import StickyUserOverlay from 'src/components/StickyUserOverlay.vue';
export default {
  name: 'Admin',
  components: { StickyUserOverlay },
  data () {
    return {
      error: '',
      errorDetails: undefined,
      editedUsername: '',
      editedUser: {
        username: '',
        password: '',
        canCreateRooms: undefined,
      },
      newUser: {
        username: '',
        password: '',
        canCreateRooms: false,
      },
      users: {
      },
    };
  },
  async created () {
    this.fetchUsers();
  },
  methods: {
    // async logoutAdmin () {
    //   await logout();
    //   this.$router.replace('/admin');
    // },
    async fetchUsers () {
      const response = await getAdmin('/get-users');
      console.log(response.data);
      this.users = response.data;
    },
    async updateUser (data) {
      console.log(data);
      try {
        const userData = {};
        userData[data.username] = { password: data.password, canCreateRooms: data.canCreateRooms };
        await postAdmin('/update-users', userData);
        await this.fetchUsers();
        this.stopEditUser();
      } catch (err) {
        console.error({ err });
        this.error = 'Failed to update user';
        this.errorDetails = err.response.data;
      }
    },
    startEditUser (name) {
      try {
        const newObj = { username: name, password: this.users[name].password, canCreateRooms: this.users[name].canCreateRooms };
        this.editedUser = newObj;
        this.editedUsername = name;
      } catch (err) {
        console.error(err);
        this.error = 'failed to start editing user';
        this.errorDetails = err;
      }
    },
    stopEditUser () {
      this.editedUsername = undefined;
      this.editedUser = {};
    },
    toggleCanCreateRooms (username, value) {
      console.log(username, value);
      const sendData = {};
      sendData[username] = { password: this.users[username].password, canCreateRooms: value };
      this.updateUser(sendData);
    },
    async addUser () {
      const userData = {};
      userData[this.newUser.username] = { password: this.newUser.password, canCreateRooms: this.newUser.canCreateRooms };
      console.log('user to add', userData);

      try {
        const response = await postAdmin('/add-users', userData);
        console.log('response: ', response);
      } catch (err) {
        console.error({ err });
        this.error = 'failed to create user';
        this.errorDetails = err.response.data;
      }
      await this.fetchUsers();
    },
    async deleteUser (username) {
      console.log('user to delete', username);
      await postAdmin('/delete-users', [username]);
      await this.fetchUsers();
    },
  },
};
</script>

<style lang="scss" scoped>
#main-container {
  min-width: 40rem;
  // background-color: aquamarine;
}

#create-form {
  max-width: 20rem;
}
</style>
