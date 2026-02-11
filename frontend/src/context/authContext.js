import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const formatUser = (u) => {
    if (!u) return u;
    const out = { ...u };
    const fix = (field) => {
      if (!out[field]) return;
      if (typeof out[field] === "string" && !out[field].startsWith("/upload/") && !out[field].startsWith("http")) {
        out[field] = "/upload/" + out[field];
      }
    };
    fix("profilePic");
    fix("coverPic");
    return out;
  };

  const [currentUser, setCurrentUser] = useState(
    formatUser(JSON.parse(localStorage.getItem("user"))) || null
  );

  const login = async (inputs) => {
    //TO DO
    const res = await axios.post("http://localhost:8800/api/auth/login", inputs, 
      {withCredentials: true});
    setCurrentUser(formatUser(res.data));
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:8800/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      // ignore error, still clear client state
    }
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};