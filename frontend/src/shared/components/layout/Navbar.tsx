import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  GraduationCap,
  User as UserIcon,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const navLink = (to: string, children: React.ReactNode) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
        isActive(to)
          ? 'bg-[#0A7D6E] text-white shadow-sm'
          : 'text-[#344942] hover:text-[#0A7D6E] hover:bg-[#F0F6F3]'
      }`}
      onClick={closeMenus}
    >
      <span>{children}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 transition-colors duration-150">
      <nav className="border-b border-[#D4DED3] bg-tideglass-surface backdrop-blur-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center space-x-2.5 group" onClick={closeMenus} aria-label="AI Campus Recruitment System - Home">
                <div className="w-9 h-9 rounded-lg bg-[#EAF5EF] border border-[#BDE0D3] flex items-center justify-center text-[#0A7D6E] shadow-xs" aria-hidden="true">
                  <GraduationCap className="w-5 h-5 text-[#0A7D6E]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-bold text-[#1E2D27] tracking-tight font-headline group-hover:text-[#0A7D6E] transition-colors">
                    AI Campus Recruitment
                  </span>
                  <span className="text-[11px] font-medium text-[#516861] -mt-0.5">
                    University placement network
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLink('/jobs', 'Jobs')}

              {isAuthenticated && user?.role === 'student' && (
                <>
                  {navLink('/student-dashboard', 'Dashboard')}
                  {navLink('/my-applications', 'Applications')}
                  {navLink('/resume-builder', 'Resume Studio')}
                </>
              )}

              {isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin' || user?.role === 'super_admin') && (
                <>
                  {navLink('/recruiter-dashboard', 'Recruiter')}
                  {navLink('/my-jobs', 'My Drives')}
                </>
              )}

              {isAuthenticated && (user?.role === 'placement_officer' || user?.role === 'admin' || user?.role === 'super_admin') && (
                navLink('/placement-dashboard', 'Placement')
              )}

              {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') && (
                navLink('/admin-dashboard', 'Admin')
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2.5">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2.5">
                  <Link
                    to="/notifications"
                    className="p-2 rounded-xl text-[#516861] hover:text-[#0A7D6E] hover:bg-[#F0F6F3] transition-colors relative"
                    onClick={closeMenus}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" aria-hidden="true" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0A7D6E] ring-2 ring-[#FFFDF7]" aria-hidden="true" />
                  </Link>

                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center space-x-2 pl-2.5 pr-2 py-1.5 rounded-xl border border-[#D4DED3] bg-[#FFFDF7] hover:bg-[#F0F6F3] hover:border-[#0A7D6E]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A7D6E]"
                      onClick={() => setUserMenuOpen((prev) => !prev)}
                      aria-expanded={userMenuOpen}
                      aria-haspopup="true"
                      aria-label="User account menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#EAF5EF] border border-[#0A7D6E]/30 flex items-center justify-center text-[#0A7D6E] font-bold text-sm">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="hidden lg:block text-left text-xs">
                        <div className="font-bold text-[#344942] leading-tight">{user?.name}</div>
                        <div className="text-[#1E6778] font-medium capitalize">{user?.role?.replace('_', ' ')}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#516861] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#FFFDF7] border border-[#D4DED3] rounded-2xl shadow-[0_12px_32px_rgba(52,73,66,0.14)] py-1.5 z-50 animate-in">
                        <div className="px-4 py-2 border-b border-[#D4DED3]">
                          <p className="text-xs font-bold text-[#344942] truncate">{user?.name}</p>
                          <p className="text-[11px] text-[#516861] truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2.5 px-4 py-2 text-sm text-[#344942] hover:bg-[#F0F6F3] hover:text-[#0A7D6E] transition-colors font-medium"
                          onClick={closeMenus}
                        >
                          <UserIcon className="w-4 h-4 text-[#1E6778]" aria-hidden="true" />
                          <span>Profile Settings</span>
                        </Link>
                        <hr className="my-1 border-[#D4DED3]" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center space-x-2.5 w-full px-4 py-2 text-sm text-[#B91C1C] hover:bg-[#FEE2E2]/60 transition-colors text-left font-semibold"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2 sm:space-x-2.5">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#344942] hover:text-[#0A7D6E] hover:bg-[#F0F6F3] transition-colors"
                    onClick={closeMenus}
                  >
                    Sign In
                  </Link>
                  <Button asChild variant="primary" size="sm" className="sm:px-4 sm:py-2">
                    <Link to="/register" onClick={closeMenus}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                className="md:hidden p-2 rounded-xl text-[#344942] hover:text-[#0A7D6E] hover:bg-[#E6F4F0] transition-colors"
                onClick={() => {
                  setMobileMenuOpen((prev) => !prev);
                  setUserMenuOpen(false);
                }}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div id="mobile-menu" className="md:hidden py-4 border-t border-[#D4DED3]">
              <div className="flex flex-col space-y-1.5">
                {navLink('/jobs', 'Jobs')}

                {isAuthenticated && user?.role === 'student' && (
                  <>
                    {navLink('/student-dashboard', 'Dashboard')}
                    {navLink('/my-applications', 'My Applications')}
                    {navLink('/resume-builder', 'Resume Studio')}
                  </>
                )}

                {isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin' || user?.role === 'super_admin') && (
                  <>
                    {navLink('/recruiter-dashboard', 'Recruiter Dashboard')}
                    {navLink('/my-jobs', 'My Campus Drives')}
                    {navLink('/post-job', 'Post New Drive')}
                  </>
                )}

                {isAuthenticated && (user?.role === 'placement_officer' || user?.role === 'admin' || user?.role === 'super_admin') && (
                  navLink('/placement-dashboard', 'Placement Statistics')
                )}

                {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') && (
                  navLink('/admin-dashboard', 'Administration Console')
                )}

                {!isAuthenticated && (
                  <div className="pt-3 space-y-2">
                    <Link
                      to="/login"
                      className="block text-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#344942] hover:bg-[#E6F4F0] transition-colors"
                      onClick={closeMenus}
                    >
                      Sign In
                    </Link>
                    <Button asChild variant="primary" size="md" className="w-full text-center">
                      <Link to="/register" onClick={closeMenus}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
