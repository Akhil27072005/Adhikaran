import React from 'react';
import { Home, Phone, Scale } from 'lucide-react';

const Header = ({ branding, navigation }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return <Home size={16} />;
      case 'phone':
        return <Phone size={16} />;
      default:
        return null;
    }
  };

  return (
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
                  {branding.governmentName}
                </div>
                <div 
                  style={{ fontSize: '14px', lineHeight: '1.2' }}
                >
                  {branding.ministryName}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <nav className="d-flex justify-content-end">
              <ul className="list-unstyled d-flex mb-0" style={{ gap: '24px' }}>
                {navigation.items.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href}
                      className="text-white text-decoration-none d-flex align-items-center"
                      style={{ fontSize: '14px' }}
                    >
                      {getIcon(item.icon)}
                      {item.icon && <span className="ms-1">{item.name}</span>}
                      {!item.icon && item.name}
                    </a>
                  </li>
                ))}
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
                {/* Logo */}
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
                    {branding.platformName}
                  </div>
                  <div 
                    style={{ fontSize: '18px', lineHeight: '1.2' }}
                  >
                    {branding.platformNameEnglish}
                  </div>
                  <div 
                    style={{ fontSize: '14px', lineHeight: '1.2' }}
                  >
                    {branding.platformTagline}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
