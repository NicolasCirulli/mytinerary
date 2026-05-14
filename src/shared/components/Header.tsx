import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { MenuIcon } from "@shared/icons/MenuIcon";
import { CloseIcon } from "@shared/icons/CloseIcon";
import { SunIcon } from "@shared/icons/SunIcon";
import { MoonIcon } from "@shared/icons/MoonIcon";
import {
  HomeIcon,
  GlobeIcon,
  UserIcon,
  LogInIcon,
  UserPlusIcon,
  LogOutIcon,
} from "@shared/icons/NavIcons";
import { useTheme } from "@shared/context/useTheme";
import { useAuthStore } from "@features/auth/store/auth.store";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/auth/login");
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus trap for mobile drawer (WCAG 2.1.2)
  useEffect(() => {
    if (!isMenuOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableSelector =
      'a, button, input, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      drawer.querySelectorAll<HTMLElement>(focusableSelector);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Save active element and focus first item
    const previousFocus = document.activeElement as HTMLElement;
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          // Shift+Tab: if focus is on first element, go to last
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          // Tab: if focus is on last element, go to first
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to toggle button when drawer closes
      previousFocus?.focus();
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Cities", path: "/cities", icon: GlobeIcon },
  ];

  const authLinks = isAuthenticated
    ? [{ name: "Profile", path: "/profile", icon: UserIcon }]
    : [
        { name: "Login", path: "/auth/login", icon: LogInIcon },
        { name: "Register", path: "/auth/register", icon: UserPlusIcon },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            {/* Placeholder for Logo */}
            <span className="text-xs font-bold text-primary">M</span>
          </div>
          <Link
            to="/"
            className="text-xl font-bold text-foreground"
            onClick={closeMenu}
          >
            Mytinerary
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Link>
          ))}

          {!isAuthenticated &&
            authLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}

          {/* Theme Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User Profile Dropdown (Desktop) */}
          {isAuthenticated && user && (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 focus:outline-none rounded-full ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="true"
              >
                <img
                  src={user.image || "/no-image-stock.png"}
                  alt={`${user.first_name}'s profile`}
                  className="h-8 w-8 rounded-full object-cover border border-border"
                />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 border border-border divide-y divide-border">
                  <div className="px-4 py-3">
                    <p className="text-sm text-foreground font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm font-medium border border-transparent hover:border-red-200 text-red-600 hover:bg-red-50 dark:hover:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                    >
                      <LogOutIcon className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {/* Theme Toggle (Mobile) */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User Image Button (Mobile - Opens Menu) */}
          {isAuthenticated && user && (
            <button
              onClick={toggleMenu}
              className="focus:outline-none rounded-full ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-2"
            >
              <img
                src={user.image || "/no-image-stock.png"}
                alt={`${user.first_name}'s profile`}
                className="h-8 w-8 rounded-full object-cover border border-border"
              />
            </button>
          )}

          {/* Mobile Menu Button (Hamburger) */}
          {(!isAuthenticated || !user) && (
            <button
              ref={toggleButtonRef}
              className="p-2 text-foreground hover:bg-muted rounded-md"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer & Overlay - Portaled to body */}
      {createPortal(
        <>
          {/* Overlay */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={closeMenu}
              aria-hidden="true"
            />
          )}

          {/* Drawer */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal={isMenuOpen}
            aria-label="Navigation menu"
            className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-card border-r border-border p-6 shadow-lg transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col gap-6 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">Menu</span>
                <button
                  onClick={closeMenu}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              {isAuthenticated && user && (
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <img
                    src={user.image || "/no-image-stock.png"}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover border border-border"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {user.email}
                    </span>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-3 text-base font-medium text-foreground hover:text-primary"
                    onClick={closeMenu}
                  >
                    <link.icon className="h-5 w-5 text-muted-foreground" />
                    {link.name}
                  </Link>
                ))}

                <div className="my-2 border-t border-border" />

                {authLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center gap-3 text-base font-medium text-foreground hover:text-primary"
                    onClick={closeMenu}
                  >
                    <link.icon className="h-5 w-5 text-muted-foreground" />
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {isAuthenticated && (
              <div className="mt-auto pt-4 border-t border-border">
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </>,
        document.body,
      )}
    </header>
  );
};
