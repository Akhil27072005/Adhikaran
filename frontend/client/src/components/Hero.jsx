import React from 'react';

const Hero = ({ title, description }) => {
  return (
    <section 
      className="py-5"
      style={{ backgroundColor: '#F8F8F8' }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 text-center">
            {/* Main Title */}
            <h1 
              className="fw-bold mb-4 hero-title"
              style={{ 
                fontSize: '48px',
                color: '#333333',
                lineHeight: '1.1'
              }}
            >
              {title}
            </h1>
            
            {/* Description */}
            <p 
              className="mb-0 hero-description"
              style={{
                fontSize: '18px',
                color: '#555555',
                lineHeight: '1.5',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
