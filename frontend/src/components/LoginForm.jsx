import { useState } from "react";
import { login, logout } from "../services/api";

const LoginForm = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      setMessage("Login exitoso!");
    } catch (err) {
      setMessage("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    logout();
    setMessage("Logout exitoso");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleLogout}>Logout</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoginForm;
