import { API_HOST, API_PORT, API_URL } from './Config';
const HOST = API_HOST;
const PORT = API_PORT;
const API = API_URL;
const BASE_URL = HOST + ':' + PORT + API;
// console.log({ HOST, PORT, API, BASE_URL });
export const VIDEO_API = BASE_URL + 'videos';   //GET