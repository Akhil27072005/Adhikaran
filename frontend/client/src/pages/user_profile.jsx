import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AppHeader from "../components/AppHeader";
import { Pencil, Save, X, User, Mail, Phone, MapPin, Calendar, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState({
    fullName: "",
    age: "",
    phone: "",
    postedCity: "",
    address: "",
  });
  const [editingField, setEditingField] = useState(null);
  const [message, setMessage] = useState("");
  const [tempValue, setTempValue] = useState("");
  const navigate = useNavigate();
  

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

  const userActions = [
    { label: 'Back to Dashboard', onClick: () => window.location.assign('/user-dashboard') },
    { label: 'Logout', onClick: handleLogout }
  ];
  // Load user via API using token; fallback to localStorage if needed
  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) setUser(JSON.parse(storedUser));
          return;
        }
        const decoded = jwtDecode(token);
        const userId = decoded?.sub || JSON.parse(localStorage.getItem("user")||"{}")._id;
        if (!userId) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) setUser(JSON.parse(storedUser));
          return;
        }
        const { data } = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch (_) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      }
    };
    init();
  }, []);

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
      console.log("Sending token:", token);

      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        user,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setEditingField(null);
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setMessage(`❌ Error updating profile: ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleEditClick = (key) => {
    setEditingField(key);
    setTempValue(user[key] || "");
  };

  const handleCancel = () => {
    setUser({ ...user, [editingField]: tempValue });
    setEditingField(null);
    setTempValue("");
  };

  const getFieldIcon = (key) => ({
    fullName: User,
    email: Mail,
    phone: Phone,
    postedCity: MapPin,
    age: Calendar,
    address: Home,
  }[key] || User);

  const getFieldLabel = (key) => ({
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    postedCity: "City",
    age: "Age",
    address: "Address",
  }[key] || key);

  const hiddenFields = ["_id", "__v", "password", "role", "courtAssigned"];
  const displayFields = ["fullName", "email", "phone", "age", "postedCity", "address"];

  const role = (JSON.parse(localStorage.getItem("user")||"{}")?.role) || (function(){ try { return jwtDecode(localStorage.getItem("token")||"")?.role; } catch(e){ return undefined; } })();

  return (
    <>
      {/* Role-aware App header for profile pages */}
      <AppHeader 
        title={role === 'judge' ? 'Adhikaran | Judge Portal' : 'Adhikaran | User Portal'}
        userActions={userActions}
      />
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '90vh', padding: '2rem 0', backgroundColor: '#f1eeea87' }}>
      <div className="bg-white rounded-4 p-4 w-100 shadow border" style={{ maxWidth: '48rem', borderColor: '#e5e7eb' }}>
        <div className="text-center mb-4">
          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ backgroundColor: '#d16d2e', width: '64px', height: '64px' }}>
            <User className="text-white" style={{ height: '32px', width: '32px' }} />
          </div>
          <h2 className="" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>User Profile</h2>
          <p className="mt-2" style={{ color: '#4b5563' }}>Manage your personal information</p>
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
                        <div className="rounded-circle d-flex align-items-center justify-content-center mt-1" style={{ backgroundColor: '#fdefe7', width: '28px', height: '28px' }}>
                          {React.createElement(getFieldIcon(key), { className: "", style: { height: '16px', width: '16px', color: '#d16d2e' } })}
                        </div>
                        <div className="flex-grow-1">
                          <label className="text-capitalize mb-1" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                            {getFieldLabel(key)}
                          </label>

                          {editingField === key ? (
                            key === "address" ? (
                              <textarea
                                name={key}
                                value={user[key] || ""}
                                onChange={handleChange}
                                rows="3"
                                className="form-control"
                                style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.5rem', resize: 'none' }}
                                autoFocus
                              />
                            ) : (
                              <input
                                type={key === "age" ? "number" : key === "email" ? "email" : "text"}
                                name={key}
                                value={user[key] || ""}
                                onChange={handleChange}
                                className="form-control"
                                style={{ backgroundColor: '#fff', borderColor: '#d1d5db', color: '#1f2937', padding: '0.5rem' }}
                                autoFocus
                              />
                            )
                          ) : (
                            <p className="" style={{ color: '#111827', fontSize: key === 'fullName' ? '1rem' : '0.875rem', fontWeight: key === 'fullName' ? 600 : 400 }}>
                              {user[key] || "-"}
                            </p>
                          )}
                        </div>
                      </div>

                      {editingField === key ? (
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
                          style={{ backgroundColor: '#d16d2e', color: '#fff', padding: '0.5rem', borderRadius: '0.5rem' }}
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
      </div>
    </div>
    </>
  );
}
