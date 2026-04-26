import "./App.css"
import { Routes, Route, Navigate } from "react-router-dom"
import { Register } from "./pages/Register"
import { Login } from "./pages/Login"
import { TaskList } from "./pages/TaskList"


export const App = () => {
  return (
    <div className="page">
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tasks" element={<TaskList />} />
        </Routes>
      </div>
    </div>
  )
}

export default App