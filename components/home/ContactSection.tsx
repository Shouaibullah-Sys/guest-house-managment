// components/home/ContactSection.tsx - Enhanced Contact Section with Comprehensive Theme
'use client';

import { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  CheckCircle,
  Star
} from 'lucide-react';
import { 
  lightContactTheme, 
  darkContactTheme, 
  getThemeClasses, 
  defaultContactInfo, 
  defaultSocialLinks,
  type ContactThemeVariant 
} from '@/lib/contact-theme';
import ContactForm from './ContactForm';

interface ContactSectionProps {
  variant?: ContactThemeVariant;
  showSocial?: boolean;
  showForm?: boolean;
  customTitle?: string;
  customSubtitle?: string;
  darkMode?: boolean;
}

const iconMap = {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
};

export default function ContactSection({
  variant = 'default',
  showSocial = true,
  showForm = true,
  customTitle,
  customSubtitle,
  darkMode = false,
}: ContactSectionProps) {
  const [isDark, setIsDark] = useState(darkMode);
  const theme = isDark ? darkContactTheme : lightContactTheme;
  const classes = getThemeClasses(theme, variant);

  const contactMethods = defaultContactInfo.map((method) => {
    const IconComponent = iconMap[method.icon as keyof typeof iconMap];
    
    return (
      <div key={method.id} className={classes.card}>
        <div className={classes.contactMethod}>
          <div className={classes.icon}>
            {IconComponent && <IconComponent className="w-8 h-8" />}
          </div>
          <h3 className={classes.title}>{method.title}</h3>
          {method.link ? (
            <a 
              href={method.link} 
              className={`${classes.text} hover:text-primary transition-colors cursor-pointer`}
            >
              {method.value}
            </a>
          ) : (
            <p className={classes.text}>{method.value}</p>
          )}
          {method.description && (
            <p className={classes.description}>{method.description}</p>
          )}
        </div>
      </div>
    );
  });

  const socialLinks = defaultSocialLinks.map((social) => {
    const IconComponent = iconMap[social.icon as keyof typeof iconMap];
    
    return (
      <a
        key={social.platform}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          w-12 h-12 ${theme.socialLinks.iconBackground} rounded-full 
          flex items-center justify-center transition-all duration-300 
          ${theme.socialLinks.iconColor} ${theme.socialLinks.iconHover}
          hover:scale-110 transform
        `}
        aria-label={`Follow us on ${social.platform}`}
      >
        {IconComponent && <IconComponent className="w-5 h-5" />}
      </a>
    );
  });

  return (
    <section className={classes.section}>
      <div className={classes.container}>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-amber-500 mr-2" />
            <span className="text-sm font-medium text-amber-600 uppercase tracking-wide">
              Get In Touch
            </span>
            <Star className="w-6 h-6 text-amber-500 ml-2" />
          </div>
          
          <h2 className={classes.title}>
            {customTitle || (
              <>
                Let's Start Your{' '}
                <span className="text-amber-600">Perfect Stay</span>
              </>
            )}
          </h2>
          
          <p className={classes.subtitle}>
            {customSubtitle || 
              "Have questions about your booking or need assistance? Our dedicated team is here to make your experience exceptional. Reach out to us anytime!"}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className={classes.grid}>
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                We're here to help you 24/7. Choose the most convenient way to reach us.
              </p>
            </div>

            {/* Contact Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {contactMethods}
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <a
                href="tel:+15551234567"
                className={`
                  inline-flex items-center justify-center gap-2 
                  ${classes.button} flex-1
                `}
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
              <a
                href="mailto:reservations@luxuryhotel.com"
                className={`
                  inline-flex items-center justify-center gap-2 
                  bg-gray-600 hover:bg-gray-700 text-white 
                  ${classes.button} flex-1
                `}
              >
                <Mail className="w-5 h-5" />
                Send Email
              </a>
            </div>

            {/* Social Links */}
            {showSocial && (
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center lg:text-left">
                  Follow Us
                </h4>
                <div className="flex justify-center lg:justify-start gap-4">
                  {socialLinks}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          {showForm && (
            <div>
              <ContactForm theme={theme} variant={variant} />
            </div>
          )}
        </div>

        {/* Additional Features */}
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quick Response
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                We respond to all inquiries within 2 hours during business hours.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                24/7 Support
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our guest services team is available around the clock for assistance.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Channels
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Reach us via phone, email, chat, or social media - whatever works for you.
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle (for demo purposes) */}
        {!darkMode && (
          <div className="text-center mt-8">
            <button
              onClick={() => setIsDark(!isDark)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Toggle {isDark ? 'Light' : 'Dark'} Theme
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// Export theme variants as separate components for easy usage
export const MinimalContactSection = (props: Omit<ContactSectionProps, 'variant'>) => (
  <ContactSection {...props} variant="minimal" />
);

export const ModernContactSection = (props: Omit<ContactSectionProps, 'variant'>) => (
  <ContactSection {...props} variant="modern" />
);

export const ClassicContactSection = (props: Omit<ContactSectionProps, 'variant'>) => (
  <ContactSection {...props} variant="classic" />
);
