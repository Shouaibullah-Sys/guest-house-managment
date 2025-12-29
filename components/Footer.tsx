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
    <footer
      className="bg-gradient-to-l from-gray-800 to-blue-900 text-white py-12 mt-12"
      dir="rtl"
      style={{ direction: "rtl" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Laboratory Information */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/10 p-2 rounded-xl">
                <Microscope className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-l from-white to-blue-100 bg-clip-text text-transparent">
                لابراتوار دکتر صبغت
              </h3>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed text-right">
              لابراتوار تشخیصیه حرفه‌ای که خدمات تشخیصی جامع با فناوری پیشرفته و
              تخصص تایید شده ارائه می‌دهد.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>گواهینامه ISO 15189:2012</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>سازگار با HIPAA</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-400" />
                <span>گواهینامه CLIA</span>
              </div>
            </div>
          </div>

          {/* Laboratory Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white text-right">
              خدمات ما
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>تست‌های خون و تجزیه و تحلیل</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>تست‌های ادرار و مدفوع</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>پانل بیوشیمی</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>میکروبیولوژی و کشت</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>تست‌های ایمونولوژی</span>
              </li>
            </ul>
          </div>

          {/* Developer Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white text-right">
              سیستم توسعه یافته توسط
            </h4>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-l from-blue-500 to-teal-500 p-2 rounded-lg">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white">رحیمی سلوشن</h5>
                  <p className="text-sm text-blue-300">
                    انجینری نرم‌افزار حرفه‌ای
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
                    رحیمی سلوشن
                  </a>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 text-right">
                  راه حل‌های نرم‌افزاری سفارشی برای مراقبت‌های بهداشتی، کسب و
                  کار و برنامه‌های سازمانی.
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
                <span>خدمات اضطراری ۲۴/۷ در دسترس</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <span>اضطراری: +۹۳ ۷۹۶ ۴۶۰ ۰۸۸</span>
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
              © ۲۰۲۴ سیستم مدیریت آزمایشگاه کلینیک دکتر صبغت. تمامی حقوق محفوظ
              است.
            </p>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed text-right">
              این راه حل جامع مدیریت آزمایشگاه توسط
              <span className="text-blue-300"> رحیمی سلوشن</span>
              برای ساده‌سازی تشخیص‌های پزشکی و مدیریت مراقبت از بیمار توسعه
              یافته است.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
