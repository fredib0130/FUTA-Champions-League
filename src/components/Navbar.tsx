import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, Users, BarChart3, Image as ImageIcon, Newspaper, Info, Star, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { APP_LOGO } from '../constants';

const navItems = [
  { name: 'Fixtures', path: '/fixtures', icon: Calendar },
  { name: 'Standings', path: '/table', icon: BarChart3 },
  { name: 'Rankings', path: '/rankings', icon: Star },
  { name: 'Pots', path: '/pots', icon: Trophy },
  { name: 'Playoffs', path: '/playoffs', icon: Trophy },
  { name: 'Teams', path: '/teams', icon: Users },
  { name: 'Stats', path: '/stats', icon: BarChart3 },
  { name: 'Media', path: '/media', icon: ImageIcon },
  { name: 'News', path: '/news', icon: Newspaper },
  { name: 'Sponsorship', path: '/sponsorship', icon: Star },
  { name: 'About', path: '/about', icon: Info },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={APP_LOGO} alt="FCL Logo" className="w-12 h-12 object-contain group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold tracking-tighter leading-none text-glow">FCL 2026</span>
              <span className="text-[10px] font-bold text-primary tracking-widest leading-none mt-1 uppercase italic">Champions League</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all hover:text-primary relative group",
                  location.pathname === item.path ? "text-primary bg-white/5 rounded-lg" : "text-white/70"
                )}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-4"
                  />
                )}
              </Link>
            ))}
            <Link 
              to="/contact" 
              className="ml-4 px-6 py-2 sporty-gradient rounded-full font-bold text-sm tracking-tight hover:scale-105 transition-transform"
            >
              CONTACT US
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-white/70 hover:text-primary hover:bg-white/5 rounded-xl"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <Link 
                to="/contact" 
                className="flex items-center justify-center w-full mt-4 py-4 sporty-gradient rounded-xl font-bold"
              >
                CONTACT US
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
