
import { generateAuthHeader, get } from 'src/js/auth-utils';

// const authEndpoint = 'http://localhost:6060';

export default {
  namespaced: true,
  state: {
    currentUser: null,
    authHeader: null,
    isAdmin: false,
  },
  getters: {
    isLoggedIn (state) {
      return !!state.currentUser;
    },

  },
  mutations: {
    setState (state, newState) {
      Object.assign(state, newState);
      // state = newState;
    },
    setCurrentUser (state, user) {
      state.currentUser = user;
    },
    setIsAdmin (state, isAdmin) {
      state.isAdmin = isAdmin;
    },
    setAuthHeader (state, header) {
      state.authHeader = header;
    },
    clearAuth (state) {
      state.currentUser = null;
      state.isAdmin = false;
    },
  },
  actions: {
    initFromStorage ({ commit }) {
      console.log('initFromStorage');
      const newState = localStorage.getItem('authState');
      const parsedState = JSON.parse(newState);
      console.log('state from storage:', parsedState);
      if (parsedState) {
        commit('setState', parsedState);
      }
    },
    saveToStorage ({ state }) {
      const stringifiedState = JSON.stringify(state);
      localStorage.setItem('authState', stringifiedState);
    },
    async loginUser ({ commit, dispatch }, { username, password }) {
      const header = generateAuthHeader(username, password);
      console.log('generated authHeader:', header);
      commit('setAuthHeader', header);

      const response = await get('/');

      if (response.status === 200) {
        commit('setCurrentUser', username);
        commit('setIsAdmin', false);
        dispatch('saveToStorage');
      } else {
        commit('clearAuth');
      }
    },
    async loginAdmin ({ commit, dispatch }, { username, password }) {
      const header = generateAuthHeader(username, password);
      console.log('generated authHeader:', header);
      commit('setAuthHeader', header);

      const response = await get('/admin');

      if (response.status === 200) {
        commit('setCurrentUser', username);
        commit('setIsAdmin', true);
        dispatch('saveToStorage');
      } else {
        commit('clearAuth');
        throw Error('invalid login');
      }
    },
  },
};
