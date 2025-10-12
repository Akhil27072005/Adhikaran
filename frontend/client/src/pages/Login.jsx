import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", formData);

      setMessage("✅ Login successful!");

      // Store user info in localStorage (without password)
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.accessToken);
      // Redirect based on role
      if (data.user.role === "user") navigate("/user-dashboard");
      else if (data.user.role === "judge") navigate("/judge-dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Login failed. Try again.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', padding: '2rem 0' }}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-4 p-4 w-100 shadow border"
        style={{ maxWidth: '28rem', borderColor: '#e5e7eb' }}
      >
        <h2 className="text-center mb-4" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
          Welcome Back to Adhikaran
          <br />
          <span className="mt-2 d-block" style={{ color: '#0e2340' }}>Log In</span>
        </h2>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-100 btn mb-3 ${loading ? '' : ''}`}
          style={{ backgroundColor: loading ? '#fb923c' : '#ea580c', borderColor: loading ? '#fb923c' : '#ea580c', color: '#fff', padding: '0.75rem', fontWeight: 600, fontSize: '1.125rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {/* Redirect to SignUp */}
        <div className="d-flex align-items-center justify-content-center mt-3">
          <span className="me-2" style={{ color: '#4b5563' }}>Don't have an account?</span>
          <Link
            to="/register"
            className="text-decoration-none"
            style={{ color: '#ea580c', fontWeight: 600 }}
          >
            Sign Up
          </Link>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-3 text-center" style={{ fontSize: '0.875rem', fontWeight: 500, color: message.includes('✅') ? '#16a34a' : '#dc2626' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}