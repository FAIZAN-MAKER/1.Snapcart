import React from 'react';
import { ShoppingBasket, Smartphone, ShieldCheck, Globe, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-100 pt-12 pb-6 px-4 md:px-8 mt-auto font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-bold text-2xl cursor-default">
              <ShoppingBasket className="w-8 h-8" />
              <span className="tracking-tight italic">SnapCart</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Fresh groceries delivered to your doorstep in 10 minutes. Your daily needs, just a snap away.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-green-600 transition-colors cursor-pointer group">
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>support@snapcart.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-green-600 transition-colors cursor-pointer group">
                <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>www.snapcart.com</span>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-5 text-base">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="cursor-pointer hover:text-green-600 hover:translate-x-1 transition-all duration-200">About Us</li>
              <li className="cursor-pointer hover:text-green-600 hover:translate-x-1 transition-all duration-200">Careers</li>
              <li className="cursor-pointer hover:text-green-600 hover:translate-x-1 transition-all duration-200">Blog</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-gray-900 mb-5 text-base">Support</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="cursor-pointer hover:text-green-600 hover:translate-x-1 transition-all duration-200">Help Center</li>
              <li className="cursor-pointer hover:text-green-600 hover:translate-x-1 transition-all duration-200">Terms of Service</li>
              <li className="cursor-pointer hover:text-green-600 hover:translate-x-1 transition-all duration-200">Privacy Policy</li>
            </ul>
          </div>

          {/* App Section */}
          <div className="space-y-5">
            <h4 className="font-bold text-gray-900 mb-2 text-base">Get the App</h4>
            <div className="flex flex-col gap-4">
              {/* Button with Scale & Hover effect */}
              <div className="flex items-center justify-center gap-3 bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-xl transition-all duration-200">
                <Smartphone className="w-5 h-5 text-green-400" />
                <span>Download App</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                <span>100% Secure & Verified Checkout</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p className="font-medium">© 2026 SnapCart Technologies Pvt. Ltd.</p>
          <div className="flex items-center gap-2">
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">Lahore, Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
