import { useState } from "react";
import { useApiError } from "../hooks/useApiError";
import { Link, useNavigate } from "react-router-dom"
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { login } from "../lib/api";

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
          if (Array.isArray(result.details)) {
            setFieldErrors(result.details.map((d) => d.message));
          }
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
