<template>
  <q-page id="main-container" class="row justify-center">
    <div id="main-column" class="full-height column no-wrap justify-center q-py-xl">
      <div id="main-title" class=" self-end column justify-end">
        <h1>
          INCLUBIT36<span>0</span>
        </h1>
        <h2>
          {{ isCamera?'Skapa rum':'Anslut till rum' }}
        </h2>
      </div>

      <div id="ui-container" class="column no-wrap">
        <div class="q-my-md">
          <!-- <q-form> -->
          <h5 class="q-my-none">
            Rumskod
          </h5>
          <q-input
            v-model="roomName"
            dense
            :dark="false"
            outlined
            bg-color="white"
            mask="xxxxxxxxxxxxxxxx"
            class="text-black q-my-none"
          />
        </div>
        <div class="col-grow column q-my-md">
          <h5 class="q-my-none">
            Tidigare använda rum
          </h5>
          <q-list bordered class="room-list">
            <q-item v-for="room in recentRooms" :key="room.name" clickable @click="roomName = room.name">
              <q-item-section>
                {{ room.name }}
              </q-item-section>
              <q-item-section side>
                <q-btn
                  round
                  flat
                  icon="clear"
                  @click.stop="removeRoom(room)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="">
          <q-btn
            v-if="isCamera"
            no-caps
            color="primary"
            text-color="white"
            flat
            size="lg"
            @click="goToCameraPage"
          >
            <q-icon class="q-mr-md" color="primary" name="o_videocam" />
            Skicka kameraström
          </q-btn>
          <q-btn
            v-else
            color="primary"
            text-color="white"
            flat
            outline
            no-caps
            size="lg"
            @click="goToViewerPage"
          >
            <q-icon class="q-mr-md" name="wifi" color="primary" />
            Se kameraström
          </q-btn>
        </div>
      </div>
      <!-- <q-btn label="Test TURN cred api" color="pink" text-color="black" @click="getTurnCreds" /> -->
    </div>
    <q-page-sticky position="bottom-right" :offset="[30, 30]">
      <q-btn
        id="settings-button"
        size="xl"
        round
        flat
        color="white"
        icon="settings"
        to="settings"
      >
        <q-tooltip>
          Inställningar
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-page-sticky v-if="canCreateRooms" position="top-right" :offset="[20, 60]">
      <template v-if="isCamera">
        Byt till mottagarsidan:
        <q-btn
          color="primary"
          flat
          round
          icon="wifi"
          size="md"
          @click="switchView"
        />
      </template>
      <template v-else>
        Byt till sändningssidan:
        <q-btn
          color="primary"
          flat
          round
          icon="o_videocam"
          size="md"
          @click="switchView"
        />
      </template>
    </q-page-sticky>
    <sticky-user-overlay route="/login" />
  </q-page>
</template>

<script lang="ts">
import { mapMutations, mapActions, mapState } from 'vuex';
import { getUser, logout } from 'src/js/auth-utils';
import StickyUserOverlay from 'src/components/StickyUserOverlay.vue';
export default {
  name: 'Start',
  components: { StickyUserOverlay },
  props: {
    isCamera: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      roomName: '',
      recentRooms: [],
    };
  },
  computed: {
    /** @returns {any} */
    ...mapState('authState', {
      canCreateRooms: 'canCreateRooms',
    }),
  },
  created () {
    try {
      const storageResult = localStorage.getItem('recentRooms');
      if (storageResult !== null) {
        const recentRooms = JSON.parse(storageResult);
        if (recentRooms.length) {
          recentRooms.sort((a, b) => {
            return a.date < b.date ? 1 : -1;
          });
          this.recentRooms = recentRooms;
          this.roomName = recentRooms[0].name;
        }
      }
    } catch (err) {
      console.error('failed to get recent rooms from storage');
      console.error(err);
    }
  },
  methods: {
    ...mapMutations('connectionSettings', {
      setRoomNameInStore: 'setRoomName',
      setTurnCredentials: 'setTurnCredentials',
    }),
    ...mapActions('connectionSettings', {
      saveConnSettingsToStorage: 'saveSettingsToStorage',
    }),
    async logoutUser () {
      await logout();
      this.$router.replace('/login');
    },
    async getTurnCreds () {
      try {
        const response = await getUser('/get-turn-credentials');
        console.log(response);
        this.setTurnCredentials(response.data);
      } catch (err) {
        console.error({ err });
      }
    },
    addRoomToRecent () {
      const foundRoom = this.recentRooms.find(room => room.name === this.roomName);
      if (foundRoom) {
        foundRoom.date = new Date();
      } else {
        this.recentRooms.push({
          name: this.roomName,
          date: new Date(),
        });
      }
      this.saveRecentRooms();
    },
    saveRecentRooms () {
      localStorage.setItem('recentRooms', JSON.stringify(this.recentRooms));
    },
    removeRoom (room) {
      const idx = this.recentRooms.indexOf(room);
      if (idx > -1) {
        this.recentRooms.splice(idx, 1);
      }
      this.saveRecentRooms();
    },
    switchView () {
      if (this.isCamera) {
        this.$router.replace('/');
      } else {
        this.$router.replace('/camera');
      }
    },
    async goToCameraPage () {
      try {
        this.addRoomToRecent();
        this.setRoomNameInStore(this.roomName);
        await this.getTurnCreds();
        this.saveConnSettingsToStorage();
        this.$router.push('/camera/send');
      } catch (err) {
        console.error({ err });
      }
    },
    async goToViewerPage () {
      try {
        this.addRoomToRecent();
        this.setRoomNameInStore(this.roomName);
        await this.getTurnCreds();
        this.saveConnSettingsToStorage();
        this.$router.push('/watch');
      } catch (err) {
        console.error({ err });
      }
    },
  },
};
</script>

<style scoped lang="scss">
#main-container {
  // display: flex;
  // flex-direction: column;
  // min-height: inherit;
  height: 100vh;
  // background: blue;
  // justify-content: center;

  // display: grid;
  // grid-template-columns: 1fr;
  // grid-template-rows: 1fr;
}

#main-column {
  min-width: 10rem;
  max-width: 20rem;
}

#ui-container {
  flex: 0.7 1 auto;
}

// #main-container div {
//   // flex: 1 1 0;
//   // justify-self: center;
//   // align-self: center;

//   // * {
//   //   margin: 3rem;
//   // }
// }

#main-title {
  flex: 0 1 auto;
  h1 {
    font-size: 3.5rem;
    letter-spacing: 1rem;
    text-align: end;
    // direction: rtl;
    span {
      letter-spacing: 0;
    }
  }

  h2 {
    color: $secondary;
    font-family: 'Dosis', sans-serif;
    margin-top: -0.8em;
    text-transform: lowercase;
    text-align: end;
    // font-style: italic;
    font-weight: 200;
  }
}

.room-list {
  // min-width: 15rem;
  overflow-y: auto;
  flex: 1 1 0;
  min-height: 10rem;
  background-color: $primary;
}

// #settings-button {
//   position: fixed;
//   bottom: 3rem;
//   right: 3rem;
// }
</style>
