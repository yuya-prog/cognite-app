"use client";

import { Amplify } from "aws-amplify";
import config from "@/config/aws";
import React, { useContext, useState, ReactNode } from "react";
import { signIn } from "aws-amplify/auth";
import message from "@/config/message";
import { getCurrentUser } from "aws-amplify/auth"; // 追加

// Amplify 設定
Amplify.configure(config, { ssr: true });

type LoginResult = {
  isSuccessed: boolean;
  errorMessage?: string;
  urlTo?: string;
};

type AuthContextType = {
  login: (email: string, password: string) => Promise<LoginResult>;
  user: { email: string } | undefined;
  isLoading: boolean;
};

// Context 作成（型を明示）
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// useAuth フック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider の props 型
type AuthProviderProps = {
  children: ReactNode;
};

// Provider コンポーネント
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<{ email: string } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化：現在のユーザーを取得
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { username } = await getCurrentUser();
        setUser({ email: username });
      } catch {
        // 未ログインの場合は何もしない
      } finally {
        setIsLoading(false); // ここでローディング終了
      }
    };

    fetchUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      await signIn({ username: email, password });
      setUser({ email });
      return { isSuccessed: true, urlTo: "/" };
    } catch (error) {
      console.error("ログインエラー:", error);
      return {
        isSuccessed: false,
        errorMessage: message.M1001,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ login, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
