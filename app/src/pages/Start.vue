<template>
  <q-page id="main-container" class="items-center justify-evenly column">
    <!-- <div  > -->
    <div class="col-auto row q-gutter-md items-center">
      <!-- <q-form> -->
      <h2 class="q-my-none">
        Namn på rum:
      </h2>
      <q-input
        v-model="roomName"
        dense
        outlined
        bordered
        mask="xxxxxxxxxxxxxxxx"
        class="q-my-none"
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
    <div class="col-6 column q-pa-md">
      <h3 class="col-auto">
        Tidigare använda rum
      </h3>
      <q-list bordered class="col scroll">
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
        color="primary"
        class="q-mx-xl"
        size="lg"
        label="Titta på kameraström"
        @click="goToViewerPage"
      />
      <q-btn
        color="primary"
        class="q-mx-xl"
        size="md"
        label="Skicka kameraström"
        @click="goToCameraPage"
      />
    </div>
    <q-page-sticky position="bottom-right" :offset="[40, 40]">
      <q-btn
        id="settings-button"
        size="xl"
        round
        color="black"
        icon="settings"
        to="settings"
      >
        <q-tooltip>
          Inställningar
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <!-- </div> -->
  </q-page>
</template>

<script lang="ts">
import { mapMutations, mapActions } from 'vuex';
export default {
  name: 'Start',
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
      this.$router.push('/camera');
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

#main-container div {
  // flex: 1 1 0;
  // justify-self: center;
  // align-self: center;

  // * {
  //   margin: 3rem;
  // }
}

// #settings-button {
//   position: fixed;
//   bottom: 3rem;
//   right: 3rem;
// }
</style>
