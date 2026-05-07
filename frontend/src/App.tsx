import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login, Register } from "./features/auth";
import { TaskList } from "./features/tasks";


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
  );
};
