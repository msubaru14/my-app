import { useState } from "react"
import { createUser } from "../lib/api"
import { useNavigate } from "react-router-dom"

export const Register = () => {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // フロントバリデーション（最低限）
    const newErrors: Record<string, string> = {}
    if (!name) newErrors.name = "ユーザー名は必須です"
    if (!email) newErrors.email = "メールアドレスは必須です"
    if (!password) newErrors.password = "パスワードは必須です"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await createUser(name, email, password)
      navigate("/")
    } catch (e) {
      console.error(e)
      alert("登録に失敗しました")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p>{errors.name}</p>}
      </div>

      <div>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p>{errors.email}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p>{errors.password}</p>}
      </div>

      <button type="submit">登録</button>
    </form>
  )
}
