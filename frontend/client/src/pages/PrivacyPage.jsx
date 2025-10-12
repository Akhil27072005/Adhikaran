// PRIVACY PAGE — namespace: privacypage- — Do not reuse these class names elsewhere
import React from 'react';
import Header from '../components/Header';
import '../styles/privacypage.css';

const PrivacyPage = () => {
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
    <div className="privacypage-container">
      <div className="privacypage-header-wrapper">
        <Header {...headerProps} />
      </div>
      
      <main className="privacypage-main">
        <div className="privacypage-content-wrapper">
          <div className="privacypage-content">
            <div className="privacypage-title-section">
              <h1 className="privacypage-title">Privacy Policy</h1>
              <p className="privacypage-subtitle">Last updated: January 2025</p>
            </div>

            <div className="privacypage-intro">
              <p className="privacypage-intro-text">
                At Adhikaran, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, protect, and share information when you use our judicial platform services.
              </p>
            </div>

            <div className="privacypage-sections">
              {/* Section 1: Information We Collect */}
              <section className="privacypage-section">
                <h2 className="privacypage-section-title">
                  <span className="privacypage-section-number">1.</span>
                  Information We Collect
                </h2>
                <div className="privacypage-section-content">
                  <h3 className="privacypage-subsection-title">Personal Information</h3>
                  <p className="privacypage-text">
                    We collect personal information that you provide directly to us, including your name, email address, phone number, address, and professional credentials when you register for an account or file a case.
                  </p>
                  
                  <h3 className="privacypage-subsection-title">Case Information</h3>
                  <p className="privacypage-text">
                    We collect and store case-related data including case details, evidence files, legal documents, hearing schedules, and communication records necessary for judicial proceedings.
                  </p>
                  
                  <h3 className="privacypage-subsection-title">Usage Data</h3>
                  <p className="privacypage-text">
                    We automatically collect information about how you interact with our platform, including IP addresses, browser type, device information, and usage patterns to improve our services.
                  </p>
                </div>
              </section>

              {/* Section 2: How We Use Your Information */}
              <section className="privacypage-section">
                <h2 className="privacypage-section-title">
                  <span className="privacypage-section-number">2.</span>
                  How We Use Your Information
                </h2>
                <div className="privacypage-section-content">
                  <p className="privacypage-text">
                    We use the collected information to provide and improve our judicial services, including case management, scheduling hearings, facilitating communication between parties, generating reports and analytics, ensuring platform security, and complying with legal requirements and court orders.
                  </p>
                </div>
              </section>

              {/* Section 3: Data Protection */}
              <section className="privacypage-section">
                <h2 className="privacypage-section-title">
                  <span className="privacypage-section-number">3.</span>
                  Data Protection
                </h2>
                <div className="privacypage-section-content">
                  <p className="privacypage-text">
                    We implement industry-standard security measures to protect your information, including encryption of data in transit and at rest, secure access controls and authentication, regular security audits and monitoring, and compliance with applicable data protection regulations. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>
              </section>

              {/* Section 4: User Rights */}
              <section className="privacypage-section">
                <h2 className="privacypage-section-title">
                  <span className="privacypage-section-number">4.</span>
                  User Rights
                </h2>
                <div className="privacypage-section-content">
                  <p className="privacypage-text">
                    You have the right to access, update, or delete your personal information, request a copy of your data, opt-out of non-essential communications, and file complaints with relevant data protection authorities. Please note that some information may be retained as required by law or for legitimate judicial purposes.
                  </p>
                </div>
              </section>

              {/* Section 5: Cookies & Analytics */}
              <section className="privacypage-section">
                <h2 className="privacypage-section-title">
                  <span className="privacypage-section-number">5.</span>
                  Cookies & Analytics
                </h2>
                <div className="privacypage-section-content">
                  <p className="privacypage-text">
                    We use cookies and similar technologies to enhance your experience, maintain your session, analyze platform usage, and improve our services. You can control cookie settings through your browser preferences, though some features may not function properly if cookies are disabled.
                  </p>
                </div>
              </section>

              {/* Section 6: Updates to This Policy */}
              <section className="privacypage-section">
                <h2 className="privacypage-section-title">
                  <span className="privacypage-section-number">6.</span>
                  Updates to This Policy
                </h2>
                <div className="privacypage-section-content">
                  <p className="privacypage-text">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify users of significant changes through email or platform notifications. Continued use of our services after such changes constitutes acceptance of the updated policy.
                  </p>
                </div>
              </section>
            </div>

            <div className="privacypage-contact">
              <div className="privacypage-contact-card">
                <h3 className="privacypage-contact-title">Questions About This Policy?</h3>
                <p className="privacypage-contact-text">
                  If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@adhikaran.gov.in or through our support portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
