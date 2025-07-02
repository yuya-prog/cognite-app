"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";

export default function ConfirmForm() {
  const { confirm } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await confirm(email, code);
    if (result.isSuccessed) {
      router.push(result.urlTo!);
    } else {
      setError(result.errorMessage ?? "確認に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="認証コード"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button type="submit">確認</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
