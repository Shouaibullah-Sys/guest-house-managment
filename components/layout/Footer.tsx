// components/layout/Footer.tsx - Enhanced version
"use client";

import {
  Hotel,
  Instagram,
  Twitter,
  Facebook,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effect for the background text
  const backgroundTextY = useTransform(scrollY, [0, 1000], [0, -50]);
  const backgroundTextOpacity = useTransform(scrollY, [0, 800], [0.3, 0.1]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show footer when near bottom (last 500px)
      if (scrollTop + windowHeight >= documentHeight - 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  const quickLinks = [
    "Home",
    "Rooms",
    "Amenities",
    "Dining",
    "Contact",
    "Gallery",
  ];

  return (
    <motion.footer
      initial={{ y: "100%", opacity: 0 }}
      animate={{
        y: isVisible ? "0%" : "100%",
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.7,
      }}
      className="fixed bottom-0 left-0 right-0 h-[320px] bg-gradient-to-t from-gray-900 to-gray-950 border-t border-amber-500/20 shadow-2xl shadow-black/50 z-40 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent" />

      <div className="relative h-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 h-full max-w-7xl mx-auto">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20"
                animate={{ rotate: isVisible ? 0 : 360 }}
                transition={{ duration: 0.5 }}
              >
                <Hotel className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                  Luxury Hotel
                </h3>
                <p className="text-sm text-gray-400 mt-1">Premium Experience</p>
              </div>
            </motion.div>

            <p className="text-gray-500 text-sm leading-relaxed">
              Experience unparalleled luxury and world-class service at our
              premium resort destination.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isVisible ? 1 : 0,
                    scale: isVisible ? 1 : 0,
                  }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: isVisible ? 1 : 0,
                    x: isVisible ? 0 : -10,
                  }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <motion.a
                    href="#"
                    whileHover={{ x: 5, color: "#fbbf24" }}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-3">
              <motion.div
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-8 h-8 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                  <Phone className="w-3 h-3 text-gray-400 group-hover:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Reservations</p>
                  <a
                    href="tel:+15551234567"
                    className="text-white hover:text-amber-400 transition-colors"
                  >
                    +93 (0790) 361-638
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-8 h-8 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                  <Mail className="w-3 h-3 text-gray-400 group-hover:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a
                    href="mailto:reservations@luxuryhotel.com"
                    className="text-white hover:text-amber-400 transition-colors"
                  >
                    nawaztotakhail0@gmail.com
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-8 h-8 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                  <MapPin className="w-3 h-3 text-gray-400 group-hover:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">Kabul, Shahere Naw</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm">
              Subscribe for exclusive offers and luxury experiences.
            </p>
            <motion.form
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        {/* Large decorative background text */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ y: backgroundTextY, opacity: backgroundTextOpacity }}
        >
          <div className="text-center">
            <span className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[200px] font-black text-white/5 tracking-tighter select-none">
              LUXURY
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-12 border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: isVisible ? 0 : 20, opacity: isVisible ? 1 : 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Luxury Hotel & Resort. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Accessibility"].map(
              (item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isVisible ? 1 : 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                >
                  {item}
                </motion.a>
              )
            )}
          </div>
        </div>
      </motion.div>
    </motion.footer>
  );
}
