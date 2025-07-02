"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.isSuccessed) {
      setError(result.errorMessage ?? "");
    } else {
      // ログイン成功後の処理（例: リダイレクト）
      router.push("/");
    }
  };

  // 新規登録ページへ遷移する関数
  const handleGoSignup = () => {
    router.push("/auth/signup");
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          required
        />
        <button type="submit">ログイン</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <button
        type="button"
        onClick={handleGoSignup}
        style={{ marginTop: "1rem" }}
      >
        新規登録
      </button>
    </>
  );
}
