// components/home/TestimonialsSection.tsx
"use client";

import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Quote, Star, Sparkles, Calendar } from "lucide-react";

const defaultTestimonials = [
  {
    text: "Our stay at the Ritz-Carlton Maldives was absolutely breathtaking. The overwater villa with private infinity pool exceeded all expectations. Truly paradise on earth!",
    imageSrc:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&auto=format&fit=crop&q=60",
    name: "James & Emma Wilson",
    username: "@luxurytravelers",
    role: "From London, UK",
    rating: 5,
    stay: "7 nights in Overwater Villa",
  },
  {
    text: "Aman Tokyo provided the perfect balance of traditional Japanese aesthetics and modern luxury. The zen garden and onsen experience was transformative.",
    imageSrc:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
    name: "Hiroshi Tanaka",
    username: "@globalexecutive",
    role: "CEO, Tokyo",
    rating: 5,
    stay: "4 nights in City View Suite",
  },
  {
    text: "Four Seasons Safari Lodge gave us a once-in-a-lifetime wildlife experience. Waking up to elephants at our private deck was magical. Service was impeccable!",
    imageSrc:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60",
    name: "The Rodriguez Family",
    username: "@adventurefamily",
    role: "From New York, USA",
    rating: 5,
    stay: "5 nights in Luxury Tent",
  },
  {
    text: "St. Moritz Alpine Resort was pure magic. The ski-in/ski-out access and panoramic mountain views from our suite were incredible. Already planning our return!",
    imageSrc:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60",
    name: "Sophia Müller",
    username: "@alpineexplorer",
    role: "Professional Skier",
    rating: 5,
    stay: "6 nights in Mountain Chalet",
  },
  {
    text: "Burj Al Arab's Royal Suite is worth every penny. The 24-karat gold iPads, private cinema, and helicopter transfer made us feel like royalty.",
    imageSrc:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
    name: "Ahmed Al-Farsi",
    username: "@luxurylifestyle",
    role: "Business Tycoon",
    rating: 5,
    stay: "3 nights in Royal Suite",
  },
  {
    text: "Six Senses Yao Noi was an eco-luxury paradise. The jungle views from our villa pool were mesmerizing, and the wellness programs were life-changing.",
    imageSrc:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60",
    name: "Isabella Rossi",
    username: "@wellnessjourney",
    role: "Wellness Influencer",
    rating: 5,
    stay: "8 nights in Jungle Villa",
  },
];

interface TestimonialProps {
  testimonials?: {
    text: string;
    imageSrc: string;
    name: string;
    username: string;
    role?: string;
    rating?: number;
    stay?: string;
  }[];
  title?: string;
  subtitle?: string;
  autoplaySpeed?: number;
  className?: string;
}

export default function TestimonialsSection({
  testimonials = defaultTestimonials,
  title = "Guest Experiences",
  subtitle = "Discover what our distinguished guests have to say about their unforgettable stays at our luxury hotels and resorts.",
  autoplaySpeed = 4000,
  className,
}: TestimonialProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
    dragFree: true,
    breakpoints: {
      "(min-width: 768px)": { slidesToScroll: 1 },
      "(min-width: 1024px)": { slidesToScroll: 2 },
    },
  });

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplaySpeed);

    return () => {
      clearInterval(autoplay);
    };
  }, [emblaApi, autoplaySpeed]);

  const allTestimonials = [...testimonials, ...testimonials];

  return (
    <section
      className={cn(
        "relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24",
        className
      )}
      id="testimonials"
    >
      {/* Luxury background with gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(245, 158, 11, 0.1) 10px, rgba(245, 158, 11, 0.1) 20px),
              repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(180, 83, 9, 0.05) 10px, rgba(180, 83, 9, 0.05) 20px)
            `,
          }}
        />

        {/* Glowing orbs */}
        <div className="bg-amber-400/10 absolute top-20 left-5 sm:left-10 md:left-20 h-32 sm:h-40 md:h-48 w-32 sm:w-40 md:w-48 rounded-full blur-2xl md:blur-3xl" />
        <div className="bg-amber-600/5 absolute bottom-20 right-5 sm:right-10 md:right-20 h-40 sm:h-52 md:h-60 w-40 sm:w-52 md:w-60 rounded-full blur-2xl md:blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative mb-10 sm:mb-12 md:mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-amber-500" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              {title}
            </h2>
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-amber-500" />
          </div>

          <motion.p
            className="text-gray-600 dark:text-gray-300 mx-auto text-base sm:text-lg md:text-xl max-w-3xl px-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Testimonials carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex cursor-grab active:cursor-grabbing">
            {allTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="flex-shrink-0 flex-grow-0 w-full sm:w-[80%] md:w-[45%] lg:w-[35%] xl:w-[30%] min-w-0 px-3 sm:px-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="relative h-full rounded-2xl bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 shadow-lg sm:shadow-xl border border-amber-200/20 dark:border-gray-700 backdrop-blur-sm"
                >
                  {/* Luxury corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-t-2 border-l-2 border-amber-500/30 rounded-tl-lg" />
                  </div>
                  <div className="absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-t-2 border-r-2 border-amber-500/30 rounded-tr-lg" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-b-2 border-l-2 border-amber-500/30 rounded-bl-lg" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-b-2 border-r-2 border-amber-500/30 rounded-br-lg" />
                  </div>

                  {/* Decorative gradient overlays */}
                  <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 -z-10 h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent blur-xl" />
                  <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 -z-10 h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-tl from-amber-600/5 to-transparent blur-xl" />

                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-amber-500 mb-4 sm:mb-6"
                  >
                    <div className="relative">
                      <Quote className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 -rotate-180 opacity-20" />
                    </div>
                  </motion.div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-3 sm:mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          i < (testimonial.rating || 5)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-700"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {testimonial.rating || 5}.0
                    </span>
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-gray-700 dark:text-gray-300 relative mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed italic line-clamp-4 sm:line-clamp-5"
                  >
                    <span className="relative">"{testimonial.text}"</span>
                  </motion.p>

                  {/* Stay duration */}
                  {testimonial.stay && (
                    <div className="mb-4 sm:mb-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs sm:text-sm border border-amber-200 dark:border-amber-800">
                        <Calendar className="h-3 w-3" />
                        {testimonial.stay}
                      </span>
                    </div>
                  )}

                  {/* User info */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex items-center gap-3 sm:gap-4 border-t border-amber-100 dark:border-gray-700 pt-4 sm:pt-6"
                  >
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 border-2 border-amber-200 dark:border-amber-800 ring-2 ring-amber-100 dark:ring-amber-900/30 ring-offset-1 sm:ring-offset-2">
                      <AvatarImage
                        src={testimonial.imageSrc}
                        alt={testimonial.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {testimonial.name}
                        </h4>
                        <span className="text-amber-500">
                          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <p className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-medium truncate">
                          {testimonial.username}
                        </p>
                        {testimonial.role && (
                          <>
                            <span className="text-gray-400 text-xs">•</span>
                            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                              {testimonial.role}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10 md:mt-12">
          {testimonials.slice(0, Math.min(testimonials.length, 4)).map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-300/30 hover:bg-amber-400 transition-all duration-300 aria-selected:bg-amber-500"
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mt-10 sm:mt-12 md:mt-16"
        >
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-4 sm:mb-6">
            Ready to create your own unforgettable experience?
          </p>
          <button
            onClick={() =>
              document
                .getElementById("booking")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 text-sm sm:text-base"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            Book Your Luxury Stay Now
          </button>
        </motion.div>
      </div>
    </section>
  );
}