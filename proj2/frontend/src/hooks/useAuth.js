import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) return { user: null, login: async()=>{}, register: async()=>{}, logout: ()=>{}, isAuthenticated: false };

  const login = async (email, password) => {
    return ctx.login({ username: email, password });
  };
  const register = async (email, password) => {
    return ctx.register({ username: email, password });
  };

  return {
    ...ctx,
    login,
    register,
    isAuthenticated: !!ctx.user,
  };
};

export default useAuth;