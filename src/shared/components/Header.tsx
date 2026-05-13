import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { MenuIcon } from '@shared/icons/MenuIcon';
import { CloseIcon } from '@shared/icons/CloseIcon';
import { SunIcon } from '@shared/icons/SunIcon';
import { MoonIcon } from '@shared/icons/MoonIcon';
import { useTheme } from '@shared/context/useTheme';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Focus trap for mobile drawer (WCAG 2.1.2)
  useEffect(() => {
    if (!isMenuOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableSelector = 'a, button, input, [tabindex]:not([tabindex="-1"])';
    const focusableElements = drawer.querySelectorAll<HTMLElement>(focusableSelector);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Save active element and focus first item
    const previousFocus = document.activeElement as HTMLElement;
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        return;
      }

      if (e.key === 'Tab') {
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

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to toggle button when drawer closes
      previousFocus?.focus();
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cities', path: '/cities' },
    { name: 'Register', path: '/register' },
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
          <Link to="/" className="text-xl font-bold text-foreground" onClick={closeMenu}>
            Mytinerary
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
          {/* Login Link (Desktop) */}
           <Link
              to="/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Login
            </Link>
            
            {/* Theme Toggle (Desktop) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
           {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

          {/* Mobile Menu Button */}
          <button
            ref={toggleButtonRef}
            className="p-2 text-foreground hover:bg-muted rounded-md"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
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
            className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-card border-r border-border p-6 shadow-lg transition-transform duration-300 ease-in-out md:hidden ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">Menu</span>
                <button onClick={closeMenu} className="p-2 text-muted-foreground hover:text-foreground">
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-base font-medium text-foreground hover:text-primary"
                    onClick={closeMenu}
                  >
                    {link.name}
                  </Link>
                ))}
                 <Link
                    to="/login"
                    className="text-base font-medium text-foreground hover:text-primary"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
              </nav>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};
