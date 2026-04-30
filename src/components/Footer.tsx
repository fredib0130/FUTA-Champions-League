import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { FOOTER_LOGO } from '../constants';

export function Footer() {
  return (
    <footer className="bg-dark border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <img src={FOOTER_LOGO} alt="FCL Logo" className="w-12 h-12 object-contain" />
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold tracking-tighter leading-none">FCL 2026</span>
                <span className="text-[10px] font-bold text-primary tracking-widest leading-none mt-1 uppercase italic">Champions League</span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Where FUTA’s Best Teams Compete for Glory. The premier student football tournament at the Federal University of Technology, Akure.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 glass rounded-full hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="https://x.com/FUTA_CL" target="_blank" rel="noreferrer" className="p-2 glass rounded-full hover:text-primary transition-colors"><Twitter size={20} /></a>
              <a href="#" className="p-2 glass rounded-full hover:text-primary transition-colors"><Instagram size={20} /></a>
              <a href="#" className="p-2 glass rounded-full hover:text-primary transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link to="/fixtures" className="hover:text-primary transition-colors">Match Schedule</Link></li>
              <li><Link to="/teams" className="hover:text-primary transition-colors">Participating Teams</Link></li>
              <li><Link to="/stats" className="hover:text-primary transition-colors">Player Statistics</Link></li>
              <li><Link to="/news" className="hover:text-primary transition-colors">Latest News</Link></li>
              <li><Link to="/sponsorship" className="hover:text-primary transition-colors">Sponsorship Tiers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link to="/about" className="hover:text-primary transition-colors">About FCL</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Brand Assets</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6">Find Us</h3>
            <ul className="space-y-4 text-white/50 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Sports Complex, FUTA Main Campus, Akure, Nigeria.</span>
              </li>
              <li className="flex items-center space-x-3">
                <a href="tel:+2348027479363" className="flex items-center space-x-3 hover:text-primary transition-colors">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span>+234 802 747 9363</span>
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <a href="mailto:futa.cl@yahoo.com" className="flex items-center space-x-3 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>futa.cl@yahoo.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-white/30 text-xs">
          <p>© 2026 FUTA Champions League. All Rights Reserved. Built for FUTA Football.</p>
        </div>
      </div>
    </footer>
  );
}
