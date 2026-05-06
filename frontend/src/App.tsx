import "./App.css"
import { Routes, Route, Navigate } from "react-router-dom"
import { Register } from "./features/auth/components/Register"
import { Login } from "./features/auth/components/Login"
import { TaskList } from "./features/tasks/components/TaskList"


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
