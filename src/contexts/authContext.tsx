"use client";
import { Amplify } from "aws-amplify";
import config from "@/config/aws";
import React, { useContext, useState } from "react";
import { signIn } from "aws-amplify/auth";
import message from "@/config/message";

Amplify.configure(config, { ssr: true });

const AuthContext = React.createContext(undefined);

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);

  // ログイン処理
  const login = async (email, password) => {
    try {
      await signIn({ username: email, password: password });
      setUser({ email: email });
      return { isSuccessed: true, errorMessage: undefined, urlTo: "/" };
    } catch (error) {
      return {
        isSuccessed: false,
        errorMessage: message.M1001,
        urlTo: undefined,
      };
    }
  };

  return (
    <AuthContext.Provider value={{ login, user }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
