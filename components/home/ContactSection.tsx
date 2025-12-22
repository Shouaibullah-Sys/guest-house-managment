// components/home/ContactSection.tsx
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-charcoal text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get in <span className="text-amber-400">Touch</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions? Our team is here to help you plan your perfect stay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Call Us</h3>
            <p className="text-gray-300">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-400">24/7 Support</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Email Us</h3>
            <p className="text-gray-300">reservations@hotel.com</p>
            <p className="text-sm text-gray-400">Response within 2 hours</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Visit Us</h3>
            <p className="text-gray-300">123 Luxury Street</p>
            <p className="text-sm text-gray-400">City Center, 10001</p>
          </div>
        </div>
      </div>
    </section>
  );
}
