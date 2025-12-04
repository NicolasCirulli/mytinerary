import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }
);

api.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        if( error.response && error.response.status === 401 ) {
            localStorage.removeItem('token');
            console.error('Unauthorized access');
        }
        return Promise.reject(error);
    }
)

export default api;