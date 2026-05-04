import { useState } from "react"
import { createUser } from "../api/authApi"
import { useNavigate, Link } from "react-router-dom"
import { AuthCard } from "./AuthCard";
import { FormField } from "./FormField";
import { useApiError } from "../../../hooks/useApiError";

export const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("");
    setFieldErrors([]);

    // フロントバリデーション（最低限）
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = "ユーザー名は必須です"
    if (!email) newErrors.email = "メールアドレスは必須です"
    if (!password) newErrors.password = "パスワードは必須です"

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(Object.values(newErrors));
      return
    }

    try {
      await createUser(name, email, password);
      navigate("/");
    } catch (err) {
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
    }
  }

  return (
    <AuthCard
      title="ユーザー登録"
      footer={
        <>
          すでにアカウントをお持ちの方は
          <Link to="/login">こちら</Link>
        </>
      }
    >
      <FormField label="名前" value={name} onChange={(e) => setName(e.target.value)} />
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

      <button className="auth-button" onClick={handleRegister}>
        登録
      </button>
    </AuthCard>
  )
}
