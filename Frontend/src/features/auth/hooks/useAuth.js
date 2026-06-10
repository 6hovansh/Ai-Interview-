import { useContext } from 'react'
import { AuthContext } from '../auth.context.jsx'
import { login, register, logout, getMe } from '../services/auth.api.js'

export const useAuth = () => {

    //useContext() is a React Hook used to access data stored in a Context.
    /**
     * Destructuring the context object to extract the user, setUser, loading, and setLoading properties.
     * const user = context.user;
       const setUser = context.setUser;
       const loading = context.loading;
       const setLoading = context.setLoading;
     */

    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context;

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            setUser(data.user);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }


    const handleRegister = async ({ email, password, name }) => {
        setLoading(true);
        try {
            const data = await register({ email, password, name });
            setUser(data.user);
        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        setLoading(true);
        try {
            const data = await logout();
            setUser(null);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }



    return { user, loading, handleLogin, handleRegister, handleLogout, };
}
