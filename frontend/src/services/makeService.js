import api from '../api/axiosGlobalInstance';

export const getMakes = () =>
    api.get('/makes/').then((res) => res.data.results);

export const createMake = (payload) =>
    api.post('/makes/', payload).then((res) => res.data);
