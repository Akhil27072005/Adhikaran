import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Gavel, Users } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "user",
    age: "",
    phone: "",
    postedCity: "",
    address: "",
    court: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/signup", formData);
      setMessage("✅ Account created successfully!");
      console.log(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error creating account";
      setMessage(`❌ ${errorMessage}`);
      console.error("Signup error:", err.response?.data || err.message);
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
          Step into Justice – Join Adhikaran Today.
          <br />
          <span className="mt-2 d-block" style={{ color: '#0e2340' }}>Sign Up</span>
        </h2>
        
        {/* Role Selection with Icons */}
<label className="form-label mb-3" style={{ fontWeight: 500, color: '#374151' }}>Select Your Role</label>
<div className="row g-3 mb-4">
  <button
    type="button"
    onClick={() => setFormData({...formData, role: "user"})}
    className="col-6 d-flex flex-column align-items-center justify-content-center p-3 rounded border"
    style={{
      backgroundColor: formData.role === "user" ? "rgb(253, 239, 231)" : "transparent",
      borderColor: formData.role === "user" ? "#d16d2e" : "#c1c5c6"
    }}
  >
    <Users 
      className="mb-2" 
      style={{
        height: '32px', width: '32px', color: "rgb(209, 109, 46)"
      }}
    />
    <span className="" style={{ fontWeight: 500, color: formData.role === "user" ? '#d16d2e' : '#374151' }}>
      User
    </span>
  </button>
  
  <button
    type="button"
    onClick={() => setFormData({...formData, role: "judge"})}
    className="col-6 d-flex flex-column align-items-center justify-content-center p-3 rounded border"
    style={{
      backgroundColor: formData.role === "judge" ? "rgb(229, 230, 230)" : "transparent",
      borderColor: formData.role === "judge" ? "#051123" : "#c1c5c6"
    }}
  >
    <Gavel 
      className="mb-2" 
      style={{
        height: '32px', width: '32px', color: "rgb(5, 17, 35)"
      }}
    />
    <span className="" style={{ fontWeight: 500, color: formData.role === "judge" ? '#051123' : '#374151' }}>
      Judge
    </span>
  </button>
</div>
        {/* Form Fields */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              className="form-control"
              style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
              required
            />
          </div>

          {/* Email */}
          <div>
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
          <div>
            <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
              required
            />
          </div>

          {/* Age and Phone in row */}
          <div className="row g-3">
            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Age</label>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="form-control"
                style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>City</label>
            <input
              type="text"
              name="postedCity"
              placeholder="Enter your city"
              value={formData.postedCity}
              onChange={handleChange}
              className="form-control"
              style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
            />
          </div>

          {/* Conditional Fields */}
          {formData.role === "user" && (
            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
              />
            </div>
          )}

          {formData.role === "judge" && (
            <div>
              <label className="form-label" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Court Assigned</label>
              <input
                type="text"
                name="court"
                placeholder="Enter court name"
                value={formData.court}
                onChange={handleChange}
                className="form-control"
                style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.75rem' }}
              />
            </div>
          )}
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          className="w-100 btn mt-3"
          style={{ backgroundColor: '#ea580c', borderColor: '#ea580c', color: '#fff', padding: '0.75rem', fontWeight: 600, fontSize: '1.125rem' }}
        >
          Create Account
        </button>

        {/* Already have account */}
        <div className="d-flex align-items-center justify-content-center mt-3">
          <span className="me-2" style={{ color: '#4b5563' }}>Already have an account?</span>
          <Link 
            to="/login"
            className="text-decoration-none"
            style={{ color: '#ea580c', fontWeight: 600 }}
          >
            Log In
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