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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    fetch("http://localhost:8080/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;

        if (!json || json.error) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          return;
        }

        setUser(json.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      });

      return () => {
        isMounted = false;
      };
  }, [token]);

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

      setFieldErrors([]);
      setError("");
      setEmail("");
      setPassword("");
    } catch {
      setError("通信エラー");
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
              onClick={handleLogin}
            >
              {loading ? "ログイン中..." : "ログイン"}
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
