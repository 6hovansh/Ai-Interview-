import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
    //by default, axios does not allow server to read cookies. To include cookies, you need to set the withCredentials option to true.

});


export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username,
            email,
            password
        }

        );
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post('/api/auth/login', {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.log(error);
        console.log("Error:", error.response?.data);
        console.log("Status:", error.response?.status);

    }
}

export async function logout() {
    try {
        const response = await api.get('/api/auth/logout', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export async function getMe() {
    try {
        const response = await api.get('/api/auth/get-me');
        return response.data;
    } catch (error) {
        console.log(error);
    }
}