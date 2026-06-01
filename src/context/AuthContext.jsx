import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("ecovan_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem("ecovan_token", data.token);
      localStorage.setItem("ecovan_user",  JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally { setLoading(false); }
  };

  const register = async (form) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      localStorage.setItem("ecovan_token", data.token);
      localStorage.setItem("ecovan_user",  JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("ecovan_token");
    localStorage.removeItem("ecovan_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
