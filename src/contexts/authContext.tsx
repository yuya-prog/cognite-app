"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signIn,
  signOut,
  getCurrentUser,
  signUp,
  confirmSignUp,
} from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import config from "@/config/aws";
import message from "@/config/message";

// Amplify 設定
Amplify.configure(config, { ssr: true });

// ログイン/登録などの結果型
type LoginResult = {
  isSuccessed: boolean;
  errorMessage?: string;
  urlTo?: string;
};

// Context の型
type AuthContextType = {
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<LoginResult>;
  confirm: (email: string, code: string) => Promise<LoginResult>;
  user: { email: string } | undefined;
  isLoading: boolean;
};

// Context 作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// useAuth フック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider 用 props 型
type AuthProviderProps = {
  children: ReactNode;
};

// Provider コンポーネント
const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<{ email: string } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化：ログイン状態を取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { username } = await getCurrentUser();
        setUser({ email: username });
      } catch {
        // 未ログイン時は無視
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ログイン処理
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

  // ログアウト処理
  const logout = async (): Promise<void> => {
    try {
      await signOut();
      setUser(undefined);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 登録処理
  const register = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      return {
        isSuccessed: true,
        urlTo: "/auth/confirm",
      };
    } catch (error) {
      console.error("登録エラー:", error);
      return {
        isSuccessed: false,
        errorMessage: message.M1002,
      };
    }
  };

  // 確認コード処理
  const confirm = async (email: string, code: string): Promise<LoginResult> => {
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      return {
        isSuccessed: true,
        urlTo: "/auth",
      };
    } catch (error) {
      console.error("確認コードエラー:", error);
      return {
        isSuccessed: false,
        errorMessage: message.M1003,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ login, logout, register, confirm, user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
