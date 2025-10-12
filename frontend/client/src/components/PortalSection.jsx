import React from 'react';
import { Users, Gavel } from 'lucide-react';

const PortalCard = ({ portal, index }) => {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'users':
        return <Users size={48} />;
      case 'gavel':
        return <Gavel size={48} />;
      default:
        return null;
    }
  };

  const getIconColor = (iconName) => {
    return iconName === 'users' ? '#FF8C00' : '#1A2B42';
  };

  return (
    <div 
      className="col-md-6 mb-4"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <a 
        href={portal.href}
        className="text-decoration-none"
        style={{ display: 'block' }}
      >
        <div 
          className="card h-100 border-0 shadow-sm portal-card"
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div 
            className="card-body d-flex flex-column align-items-center justify-content-center text-center"
            style={{ 
              padding: '48px 24px',
              minHeight: '200px'
            }}
          >
            {/* Icon */}
            <div 
              className="mb-3"
              style={{ color: getIconColor(portal.icon) }}
            >
              {getIcon(portal.icon)}
            </div>
            
            {/* Title */}
            <h3 
              className="fw-semibold mb-0"
              style={{
                fontSize: '20px',
                color: '#333333'
              }}
            >
              {portal.title}
            </h3>
          </div>
        </div>
      </a>
    </div>
  );
};

const PortalSection = ({ portals }) => {
  return (
    <section 
      className="py-5"
      style={{ backgroundColor: '#F8F8F8' }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="row">
              {portals.map((portal, index) => (
                <PortalCard 
                  key={portal.id} 
                  portal={portal} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortalSection;