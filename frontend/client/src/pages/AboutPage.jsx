// ABOUT PAGE — namespace: aboutpage- — Do not reuse these class names elsewhere
import React from 'react';
import Header from '../components/Header';
import '../styles/aboutpage.css';

const AboutPage = () => {
  const headerProps = {
    branding: {
      governmentName: "Government of India",
      ministryName: "Ministry of Law & Justice",
      platformName: "अधिकरण",
      platformNameEnglish: "Adhikaran",
      platformTagline: "Digital Justice Platform"
    },
    navigation: {
      items: [
        { name: "Home", href: "/", icon: "home" },
        { name: "Contact", href: "/contact", icon: "phone" },
        { name: "About", href: "/about" },
        { name: "Privacy", href: "/privacy" }
      ]
    }
  };

  return (
    <div className="aboutpage-container">
      <div className="aboutpage-header-wrapper">
        <Header {...headerProps} />
      </div>
      
      <main className="aboutpage-main">
        <div className="aboutpage-content-wrapper">
          <div className="aboutpage-content">
            <div className="aboutpage-title-section">
              <h1 className="aboutpage-title">About Our Platform</h1>
              <p className="aboutpage-subtitle">Transforming the judicial system through technology and innovation</p>
            </div>

            <div className="aboutpage-layout">
              <div className="aboutpage-main-content">
                {/* Overview Section */}
                <section className="aboutpage-section">
                  <div className="aboutpage-section-header">
                    <span className="aboutpage-section-icon" aria-hidden="true">🏛️</span>
                    <h2 className="aboutpage-section-title">Overview</h2>
                  </div>
                  <div className="aboutpage-section-content">
                    <p>Adhikaran is a comprehensive digital platform designed to modernize and streamline judicial processes. We bridge the gap between traditional court systems and modern technology, making legal proceedings more accessible, efficient, and transparent for all stakeholders.</p>
                  </div>
                </section>

                {/* Mission Section */}
                <section className="aboutpage-section">
                  <h2 className="aboutpage-section-title">Our Mission</h2>
                  <div className="aboutpage-section-content">
                    <p>To democratize access to justice by providing a user-friendly, secure, and efficient digital platform that connects citizens, legal professionals, and judicial authorities. We strive to reduce bureaucratic delays, enhance transparency, and ensure that justice is accessible to everyone, regardless of their technical expertise or geographical location.</p>
                  </div>
                </section>

                {/* What We Offer Section */}
                <section className="aboutpage-section">
                  <h2 className="aboutpage-section-title">What We Offer</h2>
                  <div className="aboutpage-section-content">
                    <ul className="aboutpage-feature-list">
                      <li className="aboutpage-feature-item">Case Filing & Tracking</li>
                      <li className="aboutpage-feature-item">Evidence Management</li>
                      <li className="aboutpage-feature-item">Judge & Lawyer Interface</li>
                      <li className="aboutpage-feature-item">AI-Powered Insights</li>
                      <li className="aboutpage-feature-item">Hearing Reminders & Updates</li>
                    </ul>
                  </div>
                </section>

                {/* Core Values Section */}
                <section className="aboutpage-section">
                  <h2 className="aboutpage-section-title">Our Core Values</h2>
                  <div className="aboutpage-section-content">
                    <ul className="aboutpage-values-list">
                      <li className="aboutpage-value-item">Transparency</li>
                      <li className="aboutpage-value-item">Integrity</li>
                      <li className="aboutpage-value-item">Efficiency</li>
                      <li className="aboutpage-value-item">Accessibility</li>
                    </ul>
                  </div>
                </section>

                {/* Who We Serve Section */}
                <section className="aboutpage-section">
                  <h2 className="aboutpage-section-title">Who We Serve</h2>
                  <div className="aboutpage-section-content">
                    <div className="aboutpage-serve-grid">
                      <div className="aboutpage-serve-item">
                        <h3 className="aboutpage-serve-title">Citizens</h3>
                        <p className="aboutpage-serve-desc">File cases, track progress, and access legal resources with ease.</p>
                      </div>
                      <div className="aboutpage-serve-item">
                        <h3 className="aboutpage-serve-title">Lawyers</h3>
                        <p className="aboutpage-serve-desc">Manage cases, collaborate with clients, and streamline legal workflows.</p>
                      </div>
                      <div className="aboutpage-serve-item">
                        <h3 className="aboutpage-serve-title">Judges</h3>
                        <p className="aboutpage-serve-desc">Review cases, manage hearings, and make informed decisions efficiently.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vision Section */}
                <section className="aboutpage-section">
                  <h2 className="aboutpage-section-title">Our Vision</h2>
                  <div className="aboutpage-section-content">
                    <p>We envision a future where technology serves as the cornerstone of a fair, efficient, and accessible judicial system. Through continuous innovation and user-centric design, we aim to create a platform that not only meets today's legal challenges but also adapts to the evolving needs of tomorrow's justice system.</p>
                  </div>
                </section>
              </div>

              {/* Court Timings Sidebar */}
              <aside className="aboutpage-sidebar">
                <div className="aboutpage-timings-card">
                  <h3 className="aboutpage-timings-title">Court Timings</h3>
                  <table className="aboutpage-timings-table" aria-label="Court operating hours">
                    <caption className="aboutpage-timings-caption">Regular court operating schedule</caption>
                    <thead>
                      <tr>
                        <th className="aboutpage-timings-th">Day</th>
                        <th className="aboutpage-timings-th">Opening Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="aboutpage-timings-row">
                        <td className="aboutpage-timings-td">Monday – Friday</td>
                        <td className="aboutpage-timings-td">10:00 AM – 5:00 PM</td>
                      </tr>
                      <tr className="aboutpage-timings-row">
                        <td className="aboutpage-timings-td">Saturday</td>
                        <td className="aboutpage-timings-td">10:00 AM – 1:00 PM</td>
                      </tr>
                      <tr className="aboutpage-timings-row">
                        <td className="aboutpage-timings-td">Sunday</td>
                        <td className="aboutpage-timings-td">Closed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
