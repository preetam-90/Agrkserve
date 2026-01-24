'use client';

import Link from 'next/link';
import { Tractor, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function PremiumFooter() {
  const footerLinks = {
    product: [
      { id: 'equipment', label: 'Equipment', href: '/equipment' },
      { id: 'labor', label: 'Labor', href: '/labour' },
      { id: 'pricing', label: 'Pricing', href: '/equipment#pricing' },
      { id: 'how-it-works', label: 'How It Works', href: '/#how-it-works' },
    ],
    company: [
      { id: 'about', label: 'About Us', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' },
      { id: 'careers', label: 'Careers', href: '/about#careers' },
      { id: 'blog', label: 'Blog', href: '/about#blog' },
    ],
    support: [
      { id: 'help', label: 'Help Center', href: '/help' },
      { id: 'terms', label: 'Terms of Service', href: '/terms' },
      { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
      { id: 'safety', label: 'Safety', href: '/help#safety' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-emerald-950 border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Tractor className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                AgriServe
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              India's premier platform for renting agricultural equipment, vehicles, and hiring skilled labor. Empowering farmers across the nation.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span>support@agriServe.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span>+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Pan India Service</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} AgriServe. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-400 transition-all hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* App Badges Placeholder */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm hover:border-emerald-500/30 transition-colors cursor-pointer">
                Download App
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
