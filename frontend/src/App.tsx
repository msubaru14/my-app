import { useState, useEffect } from "react";
import { TaskList } from "./components/TaskList";
import type { ErrorDetail } from "./types/error";

type User = {
  id: number;
  name: string;
  email: string;
};

function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8080/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if(!res.ok) {
          localStorage.removeItem("token");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setUser(data);
      });
  }, [token]);

  const handleLogin = async () => {
    setError("");
    setFieldErrors([]);
    
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
        const messages = (json.error.details ?? []).map((d: ErrorDetail) => d.message);
        setFieldErrors(messages);
        setError("");
        return;
      }

      // 認証エラー
      if (json.error.code === "UNAUTHORIZED") {
        setError("メールアドレスまたはパスワードが違います");
        setFieldErrors([]);
        return;
      }

      // その他
      setError("ログイン失敗");
      setFieldErrors([]);
      return;
    }

    const newToken = json.data.token;

    localStorage.setItem("token", newToken);
    setToken(newToken);

    fetch("http://localhost:8080/me", {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
    })
    .then((res) => {
      if(!res.ok) {
        localStorage.removeItem("token");
        return null;
      }
      return res.json();})
    .then((data) => {
      if (data) setUser(data);
    });

    setFieldErrors([]);
    setEmail("");
    setPassword("");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}>
      <div
        style={{
          padding: "24px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          width: "300px",
        }}
      >

        <h1 style={{ textAlign: "center", fontSize: "40px" }}>ログイン</h1>

        {user ? (
          <>
            <p style={{ marginTop: "12px", textAlign: "center" }}>こんにちは、{user.name}さん</p>

            {token && <TaskList token={token} />}

            <button
              style={{ marginTop: "12px" }}
              onClick={() => {
                localStorage.removeItem("token");
                setUser(null);
                setToken(null);
              }}
            >
            ログアウト
          </button>
          </>
          
        ) : (
          <>
            <input
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "12px",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#000"
              }}
              type="email"
              placeholder="メール"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "12px",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#000"
              }}
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px"
              }} 
              onClick={handleLogin}
            >
              ログイン
            </button>
          </>
        )}

        {fieldErrors.map((msg, i) => (
          <p key={i} style={{ color: "red" }}>{msg}</p>
        ))}
        {error && <p style={{ marginTop: "12px", textAlign: "center", color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default App;
