import "../../../components/common.css"
import { useState } from "react";
import { useApiError } from "../../../hooks/useApiError";
import { Link, useNavigate } from "react-router-dom"
import { AuthCard } from "./AuthCard";
import { FormField } from "./FormField";
import { login } from "../api/authApi";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const { resolveError } = useApiError();

  const handleLogin = async () => {
    setError("");
    setFieldErrors([]);
    setLoading(true);
    
    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.token);
      navigate("/tasks")

    } catch(err) {
      const result = resolveError(err);

      switch (result.type) {
        case "redirect":
          navigate(result.to);
          break;

        case "validation": {
          const messages =
            result.details.length > 0
              ? result.details.map((d) => d.message)
              : [result.message];

          setFieldErrors(messages);
          setError("");
          break;
        }

        case "message":
          setError(result.message);
          break;
      }
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
        <ul className="error-list">
          {fieldErrors.map((message, index) => (
            <li key={`${message}-${index}`}>{message}</li>
          ))}
        </ul>
      )}

      {error && <p className="error-message">{error}</p>}

      <button className="auth-button" onClick={handleLogin} disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </AuthCard>
  );
}
