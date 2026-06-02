import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
    //by default, axios does not allow server to read cookies. To include cookies, you need to set the withCredentials option to true.

});


export async function register({ username, email, password }) {
    try {
        const response = await axios.post('/api/auth/register', {
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
        const response = await axios.post('/api/auth/login', {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export async function logout() {
    try {
        const response = await axios.get('/api/auth/logout', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export async function getMe() {
    try {
        const response = await axios.get('/api/auth/me');
        return response.data;
    } catch (error) {
        console.log(error);
    }
}