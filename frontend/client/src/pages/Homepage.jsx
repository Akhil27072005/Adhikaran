import React  from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PortalSection from '../components/PortalSection';
import '../styles/main.css';

// Hardcoded platform data
const platformData = {
  branding: {
    governmentName: "Government of India",
    ministryName: "Ministry of Law & Justice",
    platformName: "अधिकरण",
    platformNameEnglish: "Adhikaran",
    platformTagline: "Digital Justice Platform",
    mainTitle: "Online Legal Case Management System",
    description: "Government of India's official digital platform for transparent and efficient justice delivery. Designed to serve citizens, legal practitioners, and judicial officers with secure access to legal services."
  },
  navigation: {
    items: [
      { name: "Home", icon: "home", href: "/" },
      { name: "About", icon: null, href: "/about" },
      { name: "Privacy Policy", icon: null, href: "/privacy" },
      { name: "Helpdesk", icon: "phone", href: "/helpdesk" }
    ]
  },
  portals: [
    {
      id: "user-portal",
      title: "User Portal",
      icon: "users",
      href: "/login",
      description: "Access legal services and case information"
    },
      {
        id: "judge-portal", 
        title: "Judge Portal",
        icon: "gavel",
        href: "/login",
        description: "Judicial case management and decision tools"
      }
  ]
};

const Homepage = () => {

  return (
    <div>
      

      <Header 
        branding={platformData.branding}
        navigation={platformData.navigation}
      />
      
      <Hero 
        title={platformData.branding.mainTitle}
        description={platformData.branding.description}
      />
      
      <PortalSection portals={platformData.portals} />
    </div>
  );
};

export default Homepage;
