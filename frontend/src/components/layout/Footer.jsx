import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-surface border-t border-accent/20 pt-16 pb-8 px-6 lg:px-12">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link to="/" className="text-2xl font-serif tracking-[0.2em] uppercase text-text-primary">
            Hannvis
          </Link>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs">
            Refining the digital commerce experience through editorial design and curated quality.
          </p>
        </div>

        {/* Collection Section */}
        <div className="space-y-6">
          <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent">Collections</h4>
          <ul className="space-y-4 text-sm text-text-muted">
            <li><Link to="/shop?category=new" className="hover:text-text-primary transition-colors italic font-serif">New Arrivals</Link></li>
            <li><Link to="/shop?category=essentials" className="hover:text-text-primary transition-colors">Essentials</Link></li>
            <li><Link to="/shop?category=limited" className="hover:text-text-primary transition-colors">Limited Edition</Link></li>
          </ul>
        </div>

        {/* Support Section */}
        <div className="space-y-6">
          <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent">Client Service</h4>
          <ul className="space-y-4 text-sm text-text-muted">
            <li><Link to="/shipping" className="hover:text-text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/contact" className="hover:text-text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="/faq" className="hover:text-text-primary transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className="space-y-6">
          <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-accent">Journal</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Subscribe to receive editorial updates and private collection access.
          </p>
          <div className="flex border-b border-border-mute pb-2 group focus-within:border-accent transition-all duration-300">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="bg-transparent text-xs w-full focus:outline-none placeholder:text-text-muted/50"
            />
            <button className="text-[10px] uppercase tracking-widest font-bold text-accent hover:text-text-primary transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">
        <p>&copy; {new Date().getFullYear()} Hannvis Studio. All Rights Reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          <a href="#" className="hover:text-accent transition-colors">Terms</a>
          <a href="#" className="hover:text-accent transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
};
