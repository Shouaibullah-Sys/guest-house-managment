// components/home/ContactInfo.tsx - Detailed Contact Information Component
'use client';

import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Car, 
  Plane, 
  Wifi, 
  CreditCard,
  Users,
  Building
} from 'lucide-react';
import { 
  lightContactTheme, 
  darkContactTheme, 
  type ContactInfo as ContactInfoType, 
  defaultContactInfo 
} from '@/lib/contact-theme';

interface ContactInfoProps {
  theme?: 'light' | 'dark';
  showMap?: boolean;
  showDirections?: boolean;
  showParking?: boolean;
  showTransportation?: boolean;
  customInfo?: ContactInfoType[];
}

export default function ContactInfo({
  theme = 'light',
  showMap = true,
  showDirections = true,
  showParking = true,
  showTransportation = true,
  customInfo = defaultContactInfo,
}: ContactInfoProps) {
  const isDark = theme === 'dark';
  const contactTheme = isDark ? darkContactTheme : lightContactTheme;

  const iconMap = {
    Phone,
    Mail,
    MapPin,
    Clock,
    Car,
    Plane,
    Wifi,
    CreditCard,
    Users,
    Building,
  };

  const additionalInfo = [
    ...customInfo,
    ...(showParking ? [{
      id: 'parking',
      type: 'address' as const,
      title: 'Parking',
      value: 'Complimentary valet parking available',
      description: 'Secure underground parking garage',
      icon: 'Car',
    }] : []),
    ...(showTransportation ? [{
      id: 'airport',
      type: 'address' as const,
      title: 'Airport Transfer',
      value: '15 minutes from airport',
      description: 'Complimentary shuttle service available',
      icon: 'Plane',
    }] : []),
    ...(showDirections ? [{
      id: 'directions',
      type: 'address' as const,
      title: 'Directions',
      value: 'GPS: 40.7589° N, 73.9851° W',
      description: 'Easily accessible from major highways',
      icon: 'MapPin',
    }] : []),
  ];

  const classes = {
    container: `bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-amber-200 dark:border-gray-700`,
    header: 'text-center mb-8',
    title: 'text-2xl font-bold text-gray-900 dark:text-white mb-2',
    subtitle: 'text-gray-600 dark:text-gray-300 mb-8',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    card: 'bg-amber-50 dark:bg-gray-700 rounded-xl p-6 border border-amber-100 dark:border-gray-600',
    icon: 'w-12 h-12 bg-amber-200 dark:bg-amber-600/20 rounded-full flex items-center justify-center mb-4 text-amber-700 dark:text-amber-400',
    cardTitle: 'text-lg font-semibold text-gray-900 dark:text-white mb-2',
    cardValue: 'text-gray-700 dark:text-gray-300 font-medium mb-1',
    cardDescription: 'text-sm text-gray-600 dark:text-gray-400',
    mapContainer: 'mt-8 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden',
    map: 'w-full h-full object-cover',
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h3 className={classes.title}>Contact Information</h3>
        <p className={classes.subtitle}>
          Everything you need to reach us and get around the city.
        </p>
      </div>

      <div className={classes.grid}>
        {additionalInfo.map((info) => {
          const IconComponent = iconMap[info.icon as keyof typeof iconMap];
          
          return (
            <div key={info.id} className={classes.card}>
              {IconComponent && (
                <div className={classes.icon}>
                  <IconComponent className="w-6 h-6" />
                </div>
              )}
              <h4 className={classes.cardTitle}>{info.title}</h4>
              <p className={classes.cardValue}>{info.value}</p>
              {info.description && (
                <p className={classes.cardDescription}>{info.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Map Section */}
      {showMap && (
        <div className={classes.mapContainer}>
          {/* Placeholder for actual map integration */}
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-amber-700 dark:text-amber-300 font-medium">
                Interactive Map
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                123 Luxury Avenue, Downtown District
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <a
          href="tel:+15551234567"
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 text-center flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          Call Now
        </a>
        <a
          href="mailto:reservations@luxuryhotel.com"
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 text-center flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Email Us
        </a>
      </div>
    </div>
  );
}