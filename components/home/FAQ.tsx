// components/home/FAQ.tsx - Frequently Asked Questions Component
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { lightContactTheme, darkContactTheme } from '@/lib/contact-theme';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQProps {
  theme?: 'light' | 'dark';
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
  searchable?: boolean;
  collapsible?: boolean;
}

const defaultFAQItems: FAQItem[] = [
  {
    id: 'check-in',
    question: 'What are the check-in and check-out times?',
    answer: 'Check-in is at 3:00 PM and check-out is at 11:00 AM. Early check-in and late check-out can be arranged subject to availability.',
  },
  {
    id: 'parking',
    question: 'Is parking available at the hotel?',
    answer: 'Yes, we offer complimentary valet parking for all guests. Our secure underground parking garage is monitored 24/7.',
  },
  {
    id: 'breakfast',
    question: 'Is breakfast included in the room rate?',
    answer: 'Breakfast is included in select room packages. Please check your booking details or contact us for breakfast options and pricing.',
  },
  {
    id: 'cancellation',
    question: 'What is your cancellation policy?',
    answer: 'Cancellation policies vary by rate and season. Generally, free cancellation is available up to 24 hours before arrival. Please check your specific booking terms.',
  },
  {
    id: 'pets',
    question: 'Are pets allowed?',
    answer: 'Yes, we welcome pets under 50 pounds with a advance notice. A pet fee of $75 per stay applies, and pet amenities are provided.',
  },
  {
    id: 'wifi',
    question: 'Is Wi-Fi included?',
    answer: 'Complimentary high-speed Wi-Fi is available throughout the hotel, including all guest rooms and public areas.',
  },
  {
    id: 'airport',
    question: 'Do you provide airport transportation?',
    answer: 'Yes, we offer complimentary shuttle service to and from the airport, operating every 30 minutes from 6:00 AM to 10:00 PM.',
  },
  {
    id: 'amenities',
    question: 'What amenities are available?',
    answer: 'Our amenities include a fitness center, spa, rooftop pool, business center, concierge service, and multiple dining options.',
  },
];

export default function FAQ({
  theme = 'light',
  items = defaultFAQItems,
  title = 'Frequently Asked Questions',
  subtitle = 'Find quick answers to common questions about your stay.',
  searchable = true,
  collapsible = true,
}: FAQProps) {
  const [isDark, setIsDark] = useState(theme === 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const contactTheme = isDark ? darkContactTheme : lightContactTheme;

  const filteredItems = items.filter(item =>
    searchTerm === '' ||
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const classes = {
    container: `bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-amber-200 dark:border-gray-700`,
    header: 'text-center mb-8',
    title: 'text-2xl font-bold text-gray-900 dark:text-white mb-2',
    subtitle: 'text-gray-600 dark:text-gray-300 mb-8',
    searchContainer: 'mb-8',
    search: `w-full px-4 py-3 rounded-lg border border-amber-200 dark:border-gray-600 bg-amber-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200`,
    list: 'space-y-4',
    item: 'border border-amber-100 dark:border-gray-600 rounded-lg overflow-hidden',
    button: 'w-full px-6 py-4 text-left bg-amber-50 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-between',
    question: 'text-lg font-semibold text-gray-900 dark:text-white',
    answer: 'px-6 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    icon: 'w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0',
    emptyState: 'text-center py-12',
    emptyIcon: 'w-16 h-16 text-gray-400 mx-auto mb-4',
    emptyTitle: 'text-xl font-semibold text-gray-900 dark:text-white mb-2',
    emptyText: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mr-3" />
          <h3 className={classes.title}>{title}</h3>
        </div>
        <p className={classes.subtitle}>{subtitle}</p>
      </div>

      {searchable && (
        <div className={classes.searchContainer}>
          <input
            type="text"
            placeholder="Search frequently asked questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={classes.search}
          />
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className={classes.emptyState}>
          <HelpCircle className={classes.emptyIcon} />
          <h4 className={classes.emptyTitle}>No questions found</h4>
          <p className={classes.emptyText}>
            Try adjusting your search terms or contact us directly for assistance.
          </p>
        </div>
      ) : (
        <div className={classes.list}>
          {filteredItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            
            return (
              <div key={item.id} className={classes.item}>
                {collapsible ? (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className={classes.button}
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span className={classes.question}>{item.question}</span>
                    {isExpanded ? (
                      <ChevronUp className={classes.icon} />
                    ) : (
                      <ChevronDown className={classes.icon} />
                    )}
                  </button>
                ) : (
                  <div className={classes.button}>
                    <span className={classes.question}>{item.question}</span>
                  </div>
                )}
                
                {(!collapsible || isExpanded) && (
                  <div 
                    id={`faq-answer-${item.id}`}
                    className={classes.answer}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Contact CTA */}
      <div className="mt-8 pt-8 border-t border-amber-200 dark:border-gray-600 text-center">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Still have questions?
        </h4>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Our friendly staff is here to help you 24/7.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+15551234567"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            <span>📞</span>
            Call Us
          </a>
          <a
            href="mailto:reservations@luxuryhotel.com"
            className="inline-flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            <span>✉️</span>
            Email Us
          </a>
        </div>
      </div>

      {/* Theme Toggle (for demo) */}
      {theme === 'light' && (
        <div className="text-center mt-6">
          <button
            onClick={() => setIsDark(!isDark)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
          >
            Toggle {isDark ? 'Light' : 'Dark'} Theme
          </button>
        </div>
      )}
    </div>
  );
}