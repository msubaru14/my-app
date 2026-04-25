import { Routes, Route } from "react-router-dom"
import { Register } from "./pages/Register"
import { Login } from "./pages/Login"

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App