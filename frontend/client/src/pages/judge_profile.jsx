import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Save, X, Gavel, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import AppHeader from "../components/AppHeader";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function JudgeProfile() {
  const [user, setUser] = useState({});
  const [editField, setEditField] = useState(null);
  const [message, setMessage] = useState("");
  const [tempValue, setTempValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (_) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('accessToken');
      navigate('/', { replace: true });
    }
  };

  const judgeActions = [
    { label: 'Back to Dashboard', onClick: () => window.location.assign('/judge-dashboard') },
    { label: 'View Cases', onClick: () => window.location.assign('/judge/cases') },
    { label: 'Logout', onClick: handleLogout }
  ];

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ No token found. Please log in again.");
        return;
      }

      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        user,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setEditField(null);
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setMessage(`❌ Error updating profile: ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleEditClick = (key) => {
    setEditField(key);
    setTempValue(user[key] || "");
  };

  const handleCancel = () => {
    setUser({ ...user, [editField]: tempValue });
    setEditField(null);
    setTempValue("");
  };

  const getFieldIcon = (key) => ({
    fullName: User,
    email: Mail,
    phone: Phone,
    postedCity: MapPin,
    age: Calendar,
    court: Gavel,
  }[key] || User);

  const getFieldLabel = (key) => ({
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    postedCity: "City",
    age: "Age",
    court: "Court Assigned",
  }[key] || key);

  const hiddenFields = ["_id", "__v", "password", "role", "courtAssigned"];
  const displayFields = ["fullName", "email", "phone", "age", "postedCity", "court"];

  const role = (JSON.parse(localStorage.getItem("user")||"{}")?.role) || (function(){ try { return jwtDecode(localStorage.getItem("token")||"")?.role; } catch(e){ return undefined; } })();

  return (
    <>
      {/* Role-aware App header for profile pages */}
      <AppHeader 
        title={role === 'judge' ? 'Adhikaran | Judge Portal' : 'Adhikaran | User Portal'}
        userActions={judgeActions}
      />
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh', padding: '2rem 0' }}>
      <div className="bg-white rounded-4 p-4 w-100 shadow border" style={{ maxWidth: '48rem', borderColor: '#e5e7eb' }}>
        <div className="text-center mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ backgroundColor: '#051123', width: '64px', height: '64px' }}>
            <Gavel className="text-white" style={{ height: '32px', width: '32px' }} />
          </div>
          <h2 className="" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>Judge Profile</h2>
          <p className="mt-2" style={{ color: '#4b5563' }}>Manage your account information</p>
        </div>

        <div className="row g-3">
          {displayFields.map(
            (key) =>
              !hiddenFields.includes(key) &&
              user[key] !== undefined && (
                <div key={key} className="col-md-6">
                  <div
                    className="rounded p-3 border h-100"
                    style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                  >
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="d-flex align-items-start gap-2 flex-grow-1">
                        <div className="rounded-circle d-flex align-items-center justify-content-center mt-1" style={{ backgroundColor: '#e5e6e6', width: '28px', height: '28px' }}>
                          {React.createElement(getFieldIcon(key), { className: "", style: { height: '16px', width: '16px', color: '#051123' } })}
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-capitalize mb-1" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                            {getFieldLabel(key)}
                          </label>

                          {editField === key ? (
                            <input
                              type={key === "age" ? "number" : "text"}
                              name={key}
                              value={user[key] || ""}
                              onChange={handleChange}
                              className="form-control"
                              style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.5rem' }}
                              autoFocus
                            />
                          ) : (
                            <p className="" style={{ color: '#111827', fontSize: '0.875rem' }}>{user[key] || "-"}</p>
                          )}
                        </div>
                      </div>

                      {editField === key ? (
                        <div className="d-flex align-items-center gap-2 ms-3">
                          <button
                            onClick={handleSave}
                            className="btn"
                            style={{ backgroundColor: '#16a34a', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}
                          >
                            <Save style={{ height: '16px', width: '16px' }} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="btn"
                            style={{ backgroundColor: '#6b7280', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}
                          >
                            <X style={{ height: '16px', width: '16px' }} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(key)}
                          className="btn ms-3"
                          style={{ backgroundColor: '#051123', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}
                        >
                          <Pencil style={{ height: '16px', width: '16px' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
          )}
        </div>

        {message && (
          <div className="mt-3 p-2 rounded text-center" style={{ fontSize: '0.875rem', fontWeight: 500, backgroundColor: message.includes('✅') ? '#f0fdf4' : '#fef2f2', color: message.includes('✅') ? '#15803d' : '#b91c1c', border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}` }}>
            {message}
          </div>
        )}

        <div className="mt-3 p-3 rounded border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <div className="d-flex align-items-center gap-2">
            <Gavel style={{ height: '16px', width: '16px', color: '#2563eb' }} />
            <span className="" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500 }}>Judge Account</span>
          </div>
          <p className="mt-1" style={{ fontSize: '0.75rem', color: '#2563eb' }}>
            You have access to judge-specific features and case management tools.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
