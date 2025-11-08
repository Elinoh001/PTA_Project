// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Détection du type d'appareil
  useEffect(() => {
    const dark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(dark);
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Fermer le sidebar par défaut sur mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("darkMode", !isDarkMode); // Correction de la faute de frappe
  }

  const handleExport = () => {
    // Cette fonction sera passée au Sidebar pour l'export
    console.log("Export depuis le sidebar");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">

      {/* Sidebar avec position fixe */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'fixed inset-y-0 left-0 z-30'}
        transition-transform duration-300 ease-in-out
        ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          collapsed={collapsed}
          toggleCollapse={toggleCollapse}
          onExport={handleExport}
        />
      </div>

      {/* Zone principale - LOGIQUE CORRIGÉE */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          // CORRECTION : Toujours avoir une marge sur desktop, jamais sur mobile
          // Maintenant avec des marges fixes pour compenser le sidebar fixe
          isMobile ? "ml-0" : (collapsed ? "lg:ml-20" : "lg:ml-72")
        }`}
      >
        {/* Header */}
        <Header 
          toggleSidebar={toggleSidebar} 
          isMobile={isMobile} 
        />
        
        {/* Contenu principal */}
        <main className="flex-1 w-full p-4 lg:p-6 overflow-auto bg-white dark:bg-gray-800 transition-colors">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay pour mobile - CORRIGÉ */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;