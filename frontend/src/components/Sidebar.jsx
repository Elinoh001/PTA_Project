// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

// Configuration centralisée des menus
const MENU_CONFIG = {
  admin: [
    { 
      name: "Tableau de bord", 
      path: "/dashboard", 
      icon: ChartBarIcon,
    },
    { 
      name: "Activités", 
      path: "/activities", 
      icon: DocumentTextIcon,
    },
    { 
      name: "Suivi des Activités", 
      path: "/suivi", 
      icon: ClipboardDocumentListIcon,
    },
    { 
      name: "Services", 
      path: "/services", 
      icon: BuildingOfficeIcon,
    },
    { 
      name: "Cadre Logique", 
      path: "/cadre-logique", 
      icon: DocumentChartBarIcon,
    },
    { 
      name: "PCOP", 
      path: "/pcop", 
      icon: ChartPieIcon,
    },
    { 
      name: "Utilisateurs", 
      path: "/users", 
      icon: UsersIcon,
    },
    { 
      name: "Exporter PTA", 
      path: "#", 
      icon: ArrowDownTrayIcon,
      action: "export"
    },
    { 
      name: "Paramètres", 
      path: "/settings", 
      icon: Cog6ToothIcon,
    },
  ],
  superviseur: [
    { 
      name: "Tableau de bord", 
      path: "/dashboard", 
      icon: ChartBarIcon,
    },
    { 
      name: "Activités", 
      path: "/activities", 
      icon: DocumentTextIcon,
    },
    { 
      name: "Suivi des Activités", 
      path: "/suivi", 
      icon: ClipboardDocumentListIcon,
    },
    { 
      name: "Services", 
      path: "/services", 
      icon: BuildingOfficeIcon,
    },
    { 
      name: "Cadre Logique", 
      path: "/cadre-logique", 
      icon: DocumentChartBarIcon,
    },
    { 
      name: "PCOP", 
      path: "/pcop", 
      icon: ChartPieIcon,
    },
    { 
      name: "Exporter PTA", 
      path: "#", 
      icon: ArrowDownTrayIcon,
      action: "export"
    },
  ],
  user: [
    { 
      name: "Tableau de bord", 
      path: "/dashboard", 
      icon: ChartBarIcon,
    },
    { 
      name: "Activités", 
      path: "/activities", 
      icon: DocumentTextIcon,
    },
    { 
      name: "Exporter PTA", 
      path: "#", 
      icon: ArrowDownTrayIcon,
      action: "export"
    },
  ]
};

const Sidebar = ({ isOpen, toggleSidebar, collapsed, toggleCollapse, onExport }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  const userProfile = Array.isArray(user) ? user[0] : user;
  const role = userProfile?.role || "user";
  const menuItems = MENU_CONFIG[role] || MENU_CONFIG.user;

  const navClass = (isActive) =>
    `group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out
     ${isActive ? "bg-gradient-to-r from-blue-600/40 to-indigo-600/30 text-white shadow-lg" : "text-blue-100 hover:bg-blue-600/20 hover:text-white"}
     ${collapsed ? "justify-center px-2" : ""}`;

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar - LOGIQUE DE VISIBILITÉ CORRIGÉE */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 flex flex-col
          ${collapsed ? "w-20" : "w-72"}
          bg-gradient-to-b from-blue-800/90 to-indigo-900/90 backdrop-blur-3xl 
          border-r border-white/10 shadow-2xl text-white
          h-screen
          transform transition-all duration-300 ease-in-out
          // CORRECTION : Simplification des états
          ${isOpen ? "translate-x-0" : "lg:translate-x-0 -translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-sm">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-wide">PTA - CISCO</div>
                <div className="text-xs text-blue-200">Gestion Planning / Budgets</div>
              </div>
            </div>
          ) : (
            <div className="mx-auto p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          )}

          <div className="flex items-center space-x-1">
            {/* Bouton collapse pour desktop */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 rounded-md hover:bg-white/10 transition-all"
              title={collapsed ? "Étendre" : "Réduire"}
            >
              {collapsed ? (
                <ChevronRightIcon className="h-5 w-5 text-blue-200" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5 text-blue-200" />
              )}
            </button>

            {/* Bouton fermer pour mobile */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-all"
              title="Fermer le menu"
            >
              <XMarkIcon className="h-5 w-5 text-blue-200" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.action === "export") {
              return (
                <button
                  key={item.name}
                  onClick={() => onExport && onExport()}
                  title={collapsed ? item.name : undefined}
                  className={`w-full text-left ${navClass(false)}`}
                >
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"} transition-transform group-hover:scale-110`} />
                    {!collapsed && (
                      <span className="text-sm">
                        {item.name}
                      </span>
                    )}
                  </div>
                </button>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) => navClass(isActive)}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
              >
                <Icon className={`h-5 w-5 ${collapsed ? "" : "mr-3"} transition-transform group-hover:scale-110`} />
                {!collapsed && (
                  <span className="text-sm">
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer utilisateur */}
        <div className={`p-4 border-t border-white/10 ${collapsed ? "text-center" : ""}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-md ${
              collapsed ? "mx-auto" : ""
            }`}>
              {user?.nom?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">
                  {user?.nom || user?.username || "Utilisateur"}
                </div>
                <div className="text-xs text-blue-200 truncate">
                  {user?.email || "—"}
                </div>
                <div className="text-xs text-indigo-200 italic capitalize">
                  {user?.role || "user"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;