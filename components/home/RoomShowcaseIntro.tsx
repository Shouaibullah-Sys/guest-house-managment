// components/home/RoomShowcaseIntro.tsx
import { ChevronDown } from "lucide-react";

export default function RoomShowcaseIntro() {
  return (
    <div id="rooms-showcase" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Immersive <span className="text-amber-600">Room Experience</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Scroll down to explore our luxury rooms with stunning zoom animations.
          Each section pins and reveals details as you scroll.
        </p>
        <div className="flex justify-center animate-bounce mt-12">
          <ChevronDown className="w-8 h-8 text-amber-500" />
        </div>
      </div>
    </div>
  );
}
