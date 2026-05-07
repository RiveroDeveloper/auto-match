import api from '../api/axiosGlobalInstance'

export const getCategories = () =>
    api.get('/categories/').then((res) => res.data.results);

export const createCategory = (payload) =>
    api.post('/categories/', payload).then((res) => res.data);
