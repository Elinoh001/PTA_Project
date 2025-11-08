// src/components/Header.jsx - Version corrigée
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { BellIcon, Bars3Icon, PowerIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";

const Header = ({ toggleSidebar, isMobile }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="backdrop-blur-xl bg-white/20 dark:bg-gray-900/20 shadow-lg border-b border-white/20 dark:border-gray-700 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between px-6 py-3">
        {/* CORRECTION : Bouton menu toujours visible sur mobile, conditionnel sur desktop */}
        <div className="flex items-center">
          {(isMobile || !isMobile) && ( // Toujours visible
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              className="p-2 rounded-lg text-gray-700 hover:bg-white/30 hover:shadow-md hover:scale-105 transition-all duration-200 mr-4"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
            Analyse de PTA et rapport d'activités
          </h1>
        </div>

        {/* Section droite */}
        <div className="flex items-center space-x-4">
          {/* Bouton Mode Sombre */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition-all duration-200 hover:shadow-lg bg-white/20 hover:bg-white/40 backdrop-blur-md"
            title={isDarkMode ? "Mode clair" : "Mode sombre"}
          >
            {isDarkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-700" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all duration-200 hover:shadow-lg">
            <BellIcon className="h-6 w-6 text-gray-700" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Profil utilisateur */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center space-x-2 bg-white
              /30 hover:bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm transition-all duration-200"
            >
              <div className="relative w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-inner">
                {user?.nom?.charAt(0) || user?.username?.charAt(0) || "U"}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-800">
                {user?.nom || user?.username || "Utilisateur"}
              </span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-0 mt-3 w-52 bg-white/70 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl p-3"
                >
                  <div className="px-3 py-2 border-b border-gray-200/60">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.nom || user?.username || "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "email@exemple.com"}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 mt-2 text-sm text-red-600 hover:bg-red-100/70 rounded-lg transition-all"
                  >
                    <PowerIcon className="h-5 w-5 mr-2" />
                    Se déconnecter
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
