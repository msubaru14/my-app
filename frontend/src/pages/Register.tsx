import { useState } from "react"
import { createUser } from "../lib/api"
import { useNavigate, Link } from "react-router-dom"
import { AuthCard } from "../components/AuthCard";
import { FormField } from "../components/FormField";
import { useApiError } from "../hooks/useApiError";

export const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { resolveError } = useApiError();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // フロントバリデーション（最低限）
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = "ユーザー名は必須です"
    if (!email) newErrors.email = "メールアドレスは必須です"
    if (!password) newErrors.password = "パスワードは必須です"

    if (Object.keys(newErrors).length > 0) {
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

        case "validation":
          break;

        case "message":
          alert("登録に失敗しました");
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

      <button className="auth-button" onClick={handleRegister}>
        登録
      </button>
    </AuthCard>
  )
}
