import { useState } from "react";
import type { ErrorDetail } from "../types/error";
import { Link, useNavigate } from "react-router-dom"

import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError("");
    setFieldErrors([]);
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (json.error) {
        // バリデーションエラー
        if (json.error.code === "VALIDATION_ERROR") {
          const details = Array.isArray(json.error.details) ? json.error.details : [];
          const messages = details.map((d: ErrorDetail) => d.message);

          setFieldErrors(messages);
          setError("");
          return;
        }

        // 認証エラー
        if (json.error.code === "UNAUTHORIZED") {
          setError("メールアドレスまたはパスワードが違います");
          return;
        }

        // その他
        setError("ログイン失敗");
        return;
      }

      localStorage.setItem("token", json.data.token);
      navigate("/tasks")
    } catch {
      setError("通信エラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="ログイン"
      footer={
        <>
          アカウントをお持ちでない方は
          <Link to="/register">こちら</Link>
        </>
      }
    >
      <FormField label="メール" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <FormField label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {fieldErrors.length > 0 && (
        <ul style={{ color: "#d33", margin: "8px 0", paddingLeft: "20px" }}>
          {fieldErrors.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      )}

      {error && <p style={{ color: "#d33", margin: "8px 0" }}>{error}</p>}

      <button className="auth-button" onClick={handleLogin} disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </AuthCard>
  );
}

export default Login;
