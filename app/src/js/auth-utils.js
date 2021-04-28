import axios from 'axios';
import { store } from 'src/store';

const authEndpoint = process.env.PROD ? `${process.env.BACKEND_SERVER_PROTOCOL}://${process.env.BACKEND_SERVER}/auth` : 'http://localhost:6060';

export function generateAuthHeader (username, password) {
  return 'Basic ' + btoa(unescape(encodeURIComponent(username + ':' + password)));
}

function authHeader () {
  // console.log(store.state.authState.authHeader);
  return store.state.authState.authHeader;
}

export async function get (path) {
  return axios.get(`${authEndpoint}${path}`, { headers: { authorization: authHeader() } });
}

export async function post (path, data) {
  return axios.post(`${authEndpoint}${path}`, data, { headers: { authorization: authHeader() } });
}

export async function getUser (path) {
  return axios.get(`${authEndpoint}/user${path}`, { headers: { authorization: authHeader() } });
}

export async function postUser (path, data) {
  return axios.post(`${authEndpoint}/user${path}`, data, { headers: { authorization: authHeader() } });
}

export async function getAdmin (path) {
  return axios.get(`${authEndpoint}/admin${path}`, { headers: { authorization: authHeader() } });
}

export async function postAdmin (path, data) {
  return axios.post(`${authEndpoint}/admin${path}`, data, { headers: { authorization: authHeader() } });
}

export async function logout () {
  store.dispatch('authState/logout');
}
