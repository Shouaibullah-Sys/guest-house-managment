// lib/contact-theme.ts - Comprehensive Contact Section Theme Configuration

export interface ContactTheme {
  section: {
    background: string;
    padding: string;
    maxWidth: string;
  };
  title: {
    color: string;
    fontSize: string;
    fontWeight: string;
    marginBottom: string;
  };
  subtitle: {
    color: string;
    fontSize: string;
    maxWidth: string;
    margin: string;
  };
  cards: {
    background: string;
    border: string;
    borderRadius: string;
    padding: string;
    shadow: string;
    hoverShadow: string;
  };
  contactMethods: {
    iconBackground: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
    descriptionColor: string;
  };
  form: {
    background: string;
    border: string;
    borderRadius: string;
    padding: string;
    shadow: string;
  };
  input: {
    background: string;
    border: string;
    borderRadius: string;
    padding: string;
    color: string;
    focusBorder: string;
    focusRing: string;
  };
  button: {
    background: string;
    backgroundHover: string;
    color: string;
    borderRadius: string;
    padding: string;
    fontWeight: string;
    shadow: string;
    shadowHover: string;
  };
  socialLinks: {
    iconBackground: string;
    iconColor: string;
    iconHover: string;
  };
  layout: {
    container: string;
    grid: string;
    spacing: string;
  };
}

// Light theme configuration
export const lightContactTheme: ContactTheme = {
  section: {
    background: 'bg-gradient-to-br from-amber-50 to-orange-50',
    padding: 'py-20 px-4',
    maxWidth: 'max-w-7xl',
  },
  title: {
    color: 'text-gray-900',
    fontSize: 'text-4xl md:text-5xl',
    fontWeight: 'font-bold',
    marginBottom: 'mb-6',
  },
  subtitle: {
    color: 'text-gray-600',
    fontSize: 'text-lg md:text-xl',
    maxWidth: 'max-w-3xl',
    margin: 'mx-auto',
  },
  cards: {
    background: 'bg-white',
    border: 'border border-amber-200',
    borderRadius: 'rounded-xl',
    padding: 'p-8',
    shadow: 'shadow-lg shadow-amber-100',
    hoverShadow: 'hover:shadow-xl hover:shadow-amber-200',
  },
  contactMethods: {
    iconBackground: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-gray-900',
    textColor: 'text-gray-700',
    descriptionColor: 'text-gray-500',
  },
  form: {
    background: 'bg-white',
    border: 'border border-amber-200',
    borderRadius: 'rounded-2xl',
    padding: 'p-8',
    shadow: 'shadow-2xl shadow-amber-100',
  },
  input: {
    background: 'bg-amber-50',
    border: 'border border-amber-200',
    borderRadius: 'rounded-lg',
    padding: 'px-4 py-3',
    color: 'text-gray-900',
    focusBorder: 'border-amber-400',
    focusRing: 'ring-amber-400',
  },
  button: {
    background: 'bg-amber-600',
    backgroundHover: 'hover:bg-amber-700',
    color: 'text-white',
    borderRadius: 'rounded-lg',
    padding: 'px-8 py-3',
    fontWeight: 'font-semibold',
    shadow: 'shadow-lg shadow-amber-300',
    shadowHover: 'hover:shadow-xl hover:shadow-amber-400',
  },
  socialLinks: {
    iconBackground: 'bg-amber-100',
    iconColor: 'text-amber-600',
    iconHover: 'hover:bg-amber-200',
  },
  layout: {
    container: 'container mx-auto',
    grid: 'grid grid-cols-1 lg:grid-cols-2 gap-12',
    spacing: 'space-y-8',
  },
};

// Dark theme configuration
export const darkContactTheme: ContactTheme = {
  section: {
    background: 'bg-gradient-to-br from-gray-900 to-amber-900',
    padding: 'py-20 px-4',
    maxWidth: 'max-w-7xl',
  },
  title: {
    color: 'text-white',
    fontSize: 'text-4xl md:text-5xl',
    fontWeight: 'font-bold',
    marginBottom: 'mb-6',
  },
  subtitle: {
    color: 'text-gray-300',
    fontSize: 'text-lg md:text-xl',
    maxWidth: 'max-w-3xl',
    margin: 'mx-auto',
  },
  cards: {
    background: 'bg-gray-800',
    border: 'border border-gray-700',
    borderRadius: 'rounded-xl',
    padding: 'p-8',
    shadow: 'shadow-2xl shadow-black/50',
    hoverShadow: 'hover:shadow-3xl hover:shadow-black/60',
  },
  contactMethods: {
    iconBackground: 'bg-amber-600/20',
    iconColor: 'text-amber-400',
    titleColor: 'text-white',
    textColor: 'text-gray-300',
    descriptionColor: 'text-gray-400',
  },
  form: {
    background: 'bg-gray-800',
    border: 'border border-gray-700',
    borderRadius: 'rounded-2xl',
    padding: 'p-8',
    shadow: 'shadow-2xl shadow-black/50',
  },
  input: {
    background: 'bg-gray-700',
    border: 'border border-gray-600',
    borderRadius: 'rounded-lg',
    padding: 'px-4 py-3',
    color: 'text-white',
    focusBorder: 'border-amber-400',
    focusRing: 'ring-amber-400',
  },
  button: {
    background: 'bg-amber-600',
    backgroundHover: 'hover:bg-amber-500',
    color: 'text-white',
    borderRadius: 'rounded-lg',
    padding: 'px-8 py-3',
    fontWeight: 'font-semibold',
    shadow: 'shadow-lg shadow-amber-600/30',
    shadowHover: 'hover:shadow-xl hover:shadow-amber-500/40',
  },
  socialLinks: {
    iconBackground: 'bg-amber-600/20',
    iconColor: 'text-amber-400',
    iconHover: 'hover:bg-amber-600/30',
  },
  layout: {
    container: 'container mx-auto',
    grid: 'grid grid-cols-1 lg:grid-cols-2 gap-12',
    spacing: 'space-y-8',
  },
};

// Theme variants
export type ContactThemeVariant = 'default' | 'minimal' | 'modern' | 'classic';

export const contactThemeVariants = {
  default: {
    section: 'py-20',
    cards: 'space-y-8',
    form: 'p-8',
  },
  minimal: {
    section: 'py-16',
    cards: 'space-y-6',
    form: 'p-6',
  },
  modern: {
    section: 'py-24',
    cards: 'space-y-10',
    form: 'p-10',
  },
  classic: {
    section: 'py-18',
    cards: 'space-y-9',
    form: 'p-9',
  },
};

// Contact information templates
export interface ContactInfo {
  id: string;
  type: 'phone' | 'email' | 'address' | 'social' | 'hours';
  title: string;
  value: string;
  description?: string;
  icon: string;
  link?: string;
}

export const defaultContactInfo: ContactInfo[] = [
  {
    id: 'phone',
    type: 'phone',
    title: 'Call Us',
    value: '+1 (555) 123-4567',
    description: '24/7 Guest Services',
    icon: 'Phone',
    link: 'tel:+15551234567',
  },
  {
    id: 'email',
    type: 'email',
    title: 'Email Us',
    value: 'reservations@luxuryhotel.com',
    description: 'We respond within 2 hours',
    icon: 'Mail',
    link: 'mailto:reservations@luxuryhotel.com',
  },
  {
    id: 'address',
    type: 'address',
    title: 'Visit Us',
    value: '123 Luxury Avenue',
    description: 'Downtown District, 10001',
    icon: 'MapPin',
  },
  {
    id: 'hours',
    type: 'hours',
    title: 'Reception Hours',
    value: 'Open 24/7',
    description: 'Front desk always available',
    icon: 'Clock',
  },
];

// Social media links
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  color: string;
}

export const defaultSocialLinks: SocialLink[] = [
  {
    platform: 'Facebook',
    url: 'https://facebook.com/luxuryhotel',
    icon: 'Facebook',
    color: 'hover:text-blue-600',
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/luxuryhotel',
    icon: 'Instagram',
    color: 'hover:text-pink-600',
  },
  {
    platform: 'Twitter',
    url: 'https://twitter.com/luxuryhotel',
    icon: 'Twitter',
    color: 'hover:text-blue-400',
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/company/luxuryhotel',
    icon: 'Linkedin',
    color: 'hover:text-blue-700',
  },
];

// Form validation schema
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'booking' | 'feedback' | 'support';
}

export const contactFormFields = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your full name',
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email',
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    required: false,
    placeholder: 'Enter your phone number',
  },
  {
    name: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    placeholder: 'What is this about?',
  },
  {
    name: 'type',
    label: 'Inquiry Type',
    type: 'select',
    required: true,
    options: [
      { value: 'general', label: 'General Inquiry' },
      { value: 'booking', label: 'Booking Request' },
      { value: 'feedback', label: 'Feedback' },
      { value: 'support', label: 'Customer Support' },
    ],
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    placeholder: 'Tell us more about your inquiry...',
  },
];

// Animation configurations
export const contactAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  hover: {
    whileHover: { scale: 1.02 },
    transition: { type: 'spring', stiffness: 300 },
  },
};

// Utility function to get theme classes
export const getThemeClasses = (
  theme: ContactTheme,
  variant: ContactThemeVariant = 'default'
): Record<string, string> => {
  const variantClasses = contactThemeVariants[variant];
  
  return {
    section: `${theme.section.background} ${theme.section.padding} ${variantClasses.section}`,
    container: `${theme.layout.container}`,
    title: `${theme.title.color} ${theme.title.fontSize} ${theme.title.fontWeight} ${theme.title.marginBottom}`,
    subtitle: `${theme.subtitle.color} ${theme.subtitle.fontSize} ${theme.subtitle.maxWidth} ${theme.subtitle.margin}`,
    cards: `${theme.layout.grid} ${variantClasses.cards}`,
    card: `${theme.cards.background} ${theme.cards.border} ${theme.cards.borderRadius} ${theme.cards.padding} ${theme.cards.shadow} ${theme.cards.hoverShadow} transition-all duration-300`,
    contactMethod: `text-center`,
    icon: `${theme.contactMethods.iconBackground} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${theme.contactMethods.iconColor}`,
    contactMethodTitle: `${theme.contactMethods.titleColor} text-xl font-bold mb-3`,
    text: `${theme.contactMethods.textColor}`,
    description: `${theme.contactMethods.descriptionColor} text-sm`,
    form: `${theme.form.background} ${theme.form.border} ${theme.form.borderRadius} ${theme.form.padding} ${theme.form.shadow}`,
    input: `${theme.input.background} ${theme.input.border} ${theme.input.borderRadius} ${theme.input.padding} ${theme.input.color} focus:${theme.input.focusBorder} focus:ring-2 focus:${theme.input.focusRing}`,
    button: `${theme.button.background} ${theme.button.backgroundHover} ${theme.button.color} ${theme.button.borderRadius} ${theme.button.padding} ${theme.button.fontWeight} ${theme.button.shadow} ${theme.button.shadowHover} transition-all duration-300`,
  };
};

export default {
  lightContactTheme,
  darkContactTheme,
  contactThemeVariants,
  defaultContactInfo,
  defaultSocialLinks,
  contactFormFields,
  contactAnimations,
  getThemeClasses,
};