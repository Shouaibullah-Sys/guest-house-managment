// components/Footer.tsx
"use client";

import {
  Microscope,
  Shield,
  DollarSign,
  Code,
  Mail,
  Facebook,
  Clock,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-blue-900 text-white py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Laboratory Information */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-xl">
                <Microscope className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dr. Sebghat Clinic Laboratory
              </h3>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Professional medical laboratory providing comprehensive diagnostic
              services with state-of-the-art technology and certified expertise.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>ISO 15189:2012 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                <span>CLIA Certified</span>
              </div>
            </div>
          </div>

          {/* Laboratory Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              Our Services
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Blood Tests & Analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Urine & Stool Tests</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Biochemistry Panel</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Microbiology & Culture</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Immunology Tests</span>
              </li>
            </ul>
          </div>

          {/* Developer Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">
              System Developed By
            </h4>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white">RAHIMI SOLUTION</h5>
                  <p className="text-sm text-blue-300">
                    Professional Software Engineering
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <a
                    href="mailto:rahimisolution@outlook.com"
                    className="hover:text-white transition-colors"
                  >
                    rahimisolution@outlook.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Facebook className="h-4 w-4 text-blue-400" />
                  <a
                    href="https://www.facebook.com/share/17MNceefpG/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Rahimi Solution
                  </a>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400">
                  Custom software solutions for healthcare, business, and
                  enterprise applications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>24/7 Emergency Services Available</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <span>Emergency: +93 799 999 999</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
                  <Microscope className="h-4 w-4" />
                </div>
                <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">
              © 2024 Dr. Sebghat Clinic Laboratory Management System. All rights
              reserved.
            </p>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
              This comprehensive laboratory management solution was custom
              developed by
              <span className="text-blue-300 "> RAHIMI SOLUTION </span>
              to streamline medical diagnostics and patient care management.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
