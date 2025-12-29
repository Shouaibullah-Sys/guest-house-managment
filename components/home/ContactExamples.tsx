// components/home/ContactExamples.tsx - Example usage of contact theme variants
'use client';

import { useState } from 'react';
import ContactSection, {
  MinimalContactSection,
  ModernContactSection,
  ClassicContactSection,
} from './ContactSection';
import ContactForm from './ContactForm';
import ContactInfo from './ContactInfo';
import FAQ from './FAQ';
import { darkContactTheme, lightContactTheme } from '@/lib/contact-theme';

export default function ContactExamples() {
  const [activeVariant, setActiveVariant] = useState<'default' | 'minimal' | 'modern' | 'classic'>('default');
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkContactTheme : lightContactTheme;

  const variants = [
    { id: 'default', name: 'Default', component: ContactSection },
    { id: 'minimal', name: 'Minimal', component: MinimalContactSection },
    { id: 'modern', name: 'Modern', component: ModernContactSection },
    { id: 'classic', name: 'Classic', component: ClassicContactSection },
  ] as const;

  const ActiveComponent = variants.find(v => v.id === activeVariant)?.component || ContactSection;

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Demo Controls */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contact Theme Examples
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Interactive demo showcasing all contact theme variants
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              {/* Variant Selector */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setActiveVariant(variant.id)}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${activeVariant === variant.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isDark
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                {isDark ? '🌙 Dark' : '☀️ Light'} Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Active Component Demo */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {variants.find(v => v.id === activeVariant)?.name} Variant
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Current active contact section variant
            </p>
          </div>
          
          <ActiveComponent
            variant={activeVariant}
            darkMode={isDark}
            showSocial={true}
            showForm={true}
          />
        </div>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Contact Form Demo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Form Component
            </h3>
            <ContactForm 
              theme={theme} 
              variant={activeVariant}
              onSubmit={async (data) => {
                console.log('Form submitted:', data);
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
              }}
            />
          </div>

          {/* Contact Info Demo */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information Component
            </h3>
            <ContactInfo 
              theme={isDark ? 'dark' : 'light'}
              showMap={true}
              showParking={true}
              showTransportation={true}
            />
          </div>
        </div>

        {/* FAQ Demo */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            FAQ Component
          </h3>
          <FAQ 
            theme={isDark ? 'dark' : 'light'}
            title="Hotel Services FAQ"
            subtitle="Common questions about our amenities and services"
          />
        </div>

        {/* Feature Highlights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🎨 Contact Theme Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎨</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Multiple Variants
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Default, Minimal, Modern, and Classic layouts
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌙</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Dark Mode
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatic theme switching with custom colors
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Responsive
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Optimized for mobile, tablet, and desktop
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">♿</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Accessible
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                WCAG compliant with keyboard navigation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-gray-900 text-gray-100 p-8 mt-12">
        <div className="container mx-auto">
          <h3 className="text-xl font-bold mb-4">Usage Example</h3>
          <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`import ContactSection from '@/components/home/ContactSection';

// Basic usage
<ContactSection />

// With custom options
<ContactSection 
  variant="modern"
  showSocial={true}
  showForm={true}
  customTitle="Contact Our Hotel"
  customSubtitle="Experience luxury..."
  darkMode={false}
/>

// Theme variants
<MinimalContactSection />
<ModernContactSection />
<ClassicContactSection />`}
          </pre>
        </div>
      </div>
    </div>
  );
}