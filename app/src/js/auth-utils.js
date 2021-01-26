import axios from 'axios';
import { store } from 'src/store';

const authEndpoint = 'http://localhost:6060';

export function generateAuthHeader (username, password) {
  return 'Basic ' + btoa(unescape(encodeURIComponent(username + ':' + password)));
}

function authHeader () {
  console.log(store.state.authState.authHeader);
  return store.state.authState.authHeader;
}

export async function get (path) {
  return axios.get(`${authEndpoint}${path}`, { headers: { authorization: authHeader() } });
}

export async function post (path, data) {
  return axios.post(`${authEndpoint}${path}`, data, { headers: { authorization: authHeader() } });
}
