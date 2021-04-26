<template>
  <q-page id="main-container" class="row justify-center">
    <div id="main-column" class="full-height column no-wrap">
      <h1 id="main-title" class="self-end">
        INCLUBIT36<span>0</span>
      </h1>

      <div class="col-auto q-gutter-md">
        <!-- <q-form> -->
        <h2 class="q-my-none">
          Rumskod
        </h2>
        <q-input
          v-model="roomName"
          dense
          :dark="false"
          outlined
          bg-color="white"
          mask="xxxxxxxxxxxxxxxx"
          class="text-black q-my-none"
        />

      <!-- <q-btn
        :disable="roomName"
        color="primary"
        class="q-my-none inline"
        label="Välj"
        size="md"
        type="submit"
      /> -->
      <!-- </q-form> -->
      </div>
      <div class="col-6 column q-py-md">
        <h3 class="col-auto">
          Rum
        </h3>
        <q-list bordered class="col scroll room-list">
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
      <div class="col-auto">
        <q-btn
          v-if="isCamera"
          color="primary"
          size="lg"
          label="Skicka kameraström"
          @click="goToCameraPage"
        />
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
  </q-page>
</template>

<script lang="ts">
import { mapMutations, mapActions } from 'vuex';
export default {
  name: 'Start',
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
  created () {
    try {
      const storageResult = localStorage.getItem('recentRooms');
      const recentRooms = JSON.parse(storageResult);
      if (recentRooms.length) {
        recentRooms.sort((a, b) => {
          return a.date < b.date ? 1 : -1;
        });
        this.recentRooms = recentRooms;
        this.roomName = recentRooms[0].name;
      }
    } catch (err) {
      console.error('failed to get recent rooms from storage');
      console.error(err);
    }
  },
  methods: {
    ...mapMutations('connectionSettings', {
      setRoomNameInStore: 'setRoomName',
    }),
    ...mapActions('connectionSettings', {
      saveConnSettingsToStorage: 'saveSettingsToStorage',
    }),
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
    goToCameraPage () {
      this.addRoomToRecent();
      this.setRoomNameInStore(this.roomName);
      this.saveConnSettingsToStorage();
      this.$router.push('/camera/send');
    },
    goToViewerPage () {
      this.addRoomToRecent();
      this.setRoomNameInStore(this.roomName);
      this.saveConnSettingsToStorage();
      this.$router.push('/watch');
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
  min-width: 20rem;
  max-width: 25rem;
}

#main-container div {
  // flex: 1 1 0;
  // justify-self: center;
  // align-self: center;

  // * {
  //   margin: 3rem;
  // }
}

#main-title {
  font-size: 3.5rem;
  letter-spacing: 1rem;
  text-align: end;
  // direction: rtl;
  span {
    letter-spacing: 0;
  }
}

.room-list {
  // min-width: 15rem;
  background-color: $primary;
}

// #settings-button {
//   position: fixed;
//   bottom: 3rem;
//   right: 3rem;
// }
</style>
