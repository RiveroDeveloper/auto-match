import { useState } from "react";
import { signup } from "../services/api";

const SignupForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    date_of_birth: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await signup(form);
      setMessage(data.message);
      setForm({ username: "", password: "", email: "", date_of_birth: "" });
    } catch (err) {
      setMessage(err.response?.data?.username || "Error al registrar");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} required />
      <button type="submit">Sign Up</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SignupForm;
