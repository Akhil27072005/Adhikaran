import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Scale, Home, Phone } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f9f8f4' }}>
      {/* Header Section */}
      <header className="bg-primary_ text-white">
        {/* Top Government Bar */}
        <div className="container-fluid">
          <div className="row align-items-center py-2">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {/* Indian Government Emblem */}
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      border: '1px solid #1A2B42',
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src="/assets/emblem.png" 
                      alt="Indian Government Emblem"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div 
                    className="fw-semibold"
                    style={{ fontSize: '16px', lineHeight: '1.2' }}
                  >
                    Government of India
                  </div>
                  <div 
                    style={{ fontSize: '14px', lineHeight: '1.2' }}
                  >
                    Ministry of Law & Justice
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <nav className="d-flex justify-content-end">
                <ul className="list-unstyled d-flex mb-0" style={{ gap: '24px' }}>
                  <li>
                    <Link 
                      to="/"
                      className="text-white text-decoration-none d-flex align-items-center"
                      style={{ fontSize: '14px' }}
                    >
                      <Home size={16} />
                      <span className="ms-1">Home</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/about"
                      className="text-white text-decoration-none"
                      style={{ fontSize: '14px' }}
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/privacy"
                      className="text-white text-decoration-none"
                      style={{ fontSize: '14px' }}
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="/helpdesk"
                      className="text-white text-decoration-none d-flex align-items-center"
                      style={{ fontSize: '14px' }}
                    >
                      <Phone size={16} />
                      <span className="ms-1">Helpdesk</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Orange separator line */}
          <div 
            className="w-100"
            style={{ 
              height: '2px', 
              backgroundColor: '#FF8C00',
              margin: '0'
            }}
          />
        </div>

        {/* Adhikaran Branding Section */}
        <div className="container-fluid py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="d-flex align-items-center justify-content-center">
                <div className="d-flex align-items-center">
                  {/* Logo with Scale icon */}
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#FF8C00'
                    }}
                  >
                    <Scale style={{ fontSize: '24px', color: 'white', height: '32px', width: '32px' }} />
                  </div>
                  
                  {/* Text Content */}
                  <div>
                    <div 
                      className="fw-bold"
                      style={{ fontSize: '28px', lineHeight: '1.2' }}
                    >
                      अधिकरण
                    </div>
                    <div 
                      style={{ fontSize: '18px', lineHeight: '1.2' }}
                    >
                      Adhikaran
                    </div>
                    <div 
                      style={{ fontSize: '14px', lineHeight: '1.2' }}
                    >
                      Digital Justice Platform
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1">
        <div className="container px-3 py-4">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-5" style={{ backgroundColor: '#0e2340' }}>
        <div className="container px-4">
          <div className="text-center">
            <h3 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Adhikaran</h3>
            <p className="mb-4" style={{ color: '#d1d5db' }}>
              Government of India's official digital platform for transparent and efficient justice delivery. 
              Designed to serve citizens, legal practitioners, and judicial officers with secure access to legal services.
            </p>
            
            {/* Portal Information */}
            <div className="row g-4 mb-4" style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div className="col-12 col-md-6 text-center">
                <h4 className="mb-2" style={{ fontWeight: 600, color: '#fdba74' }}>User Portal</h4>
                <p className="small" style={{ color: '#d1d5db' }}>
                  Access case information, file petitions, and track your legal proceedings
                </p>
              </div>
              <div className="col-12 col-md-6 text-center">
                <h4 className="mb-2" style={{ fontWeight: 600, color: '#fdba74' }}>Judge Portal</h4>
                <p className="small" style={{ color: '#d1d5db' }}>
                  Manage cases, review petitions, and deliver justice efficiently
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-center gap-4 small">
              <Link to="/privacy" className="text-decoration-none" style={{ color: 'rgb(209, 213, 219)', fontWeight: 500 }}>Privacy Policy</Link>
              <Link to="/about" className="text-decoration-none" style={{ color: 'rgb(209, 213, 219)', fontWeight: 500 }}>About</Link>
              <a href="/helpdesk" className="text-decoration-none" style={{ color: 'rgb(209, 213, 219)', fontWeight: 500 }}>Contact Us</a>
            </div>
            <p className="small mt-3" style={{ color: '#9ca3af' }}>
              © {new Date().getFullYear()} Adhikaran. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}