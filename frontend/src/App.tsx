import { useState, useEffect } from "react";
import { TaskList } from "./components/TaskList";

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
    const res = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("ログイン失敗");
      return;
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);
    setToken(data.token);

    fetch("http://localhost:8080/me", {
      headers: {
        Authorization: `Bearer ${data.token}`,
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

        {error && <p style={{ marginTop: "12px", textAlign: "center", color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default App;
