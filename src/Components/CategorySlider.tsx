"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Apple, Baby, Box, Coffee, Cookie, Flame, Heart, Milk, Wheat,
  ChevronLeft, ChevronRight, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  { id: 1, name: "Fruits & Vegetables", icon: Apple, color: "from-green-400 to-emerald-500" },
  { id: 2, name: "Dairy & Eggs", icon: Milk, color: "from-yellow-400 to-amber-500" },
  { id: 3, name: "Rice, Atta & Grains", icon: Wheat, color: "from-orange-400 to-red-500" },
  { id: 4, name: "Snacks & Biscuits", icon: Cookie, color: "from-pink-400 to-rose-500" },
  { id: 5, name: "Spices & Masalas", icon: Flame, color: "from-red-400 to-rose-600" },
  { id: 6, name: "Beverages & Drinks", icon: Coffee, color: "from-blue-400 to-cyan-500" },
  { id: 7, name: "Personal Care", icon: Heart, color: "from-purple-400 to-violet-500" },
  { id: 10, name: "Baby & Pet Care", icon: Baby, color: "from-rose-400 to-pink-500" },
  { id: 8, name: "Household Essentials", icon: Box, color: "from-lime-400 to-green-500" },
];

interface CategoryCardProps {
  category: (typeof categories)[0];
  onClick?: () => void;
}

const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  const Icon = category.icon;
  return (
    <motion.button
      onClick={onClick}
      className="w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative h-28 sm:h-32 rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 font-poppins">
        <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`} />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
        <div className="relative h-full flex flex-col items-center justify-center px-2 sm:px-4 text-center gap-2 sm:gap-3">
          <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-lg" />
          <h3 className="text-white font-bold text-[10px] sm:text-xs md:text-sm leading-tight line-clamp-2 drop-shadow-md uppercase tracking-wide">
            {category.name}
          </h3>
        </div>
      </div>
    </motion.button>
  );
};

interface CategorySliderProps {
  onCategorySelect?: (category: (typeof categories)[0]) => void;
}

const CategorySlider = ({ onCategorySelect }: CategorySliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(5);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, categories.length - itemsPerView);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused) {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
      return;
    }

    timeoutRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (direction === 1) {
          if (prev >= maxIndex) {
            setDirection(-1);
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev <= 0) {
            setDirection(1);
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, 4000);

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [direction, maxIndex, isPaused]);

  return (
    <section className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-poppins overflow-hidden">
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left"
        >
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg ring-4 ring-green-50">
            <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-2">
              Shop by Category
            </h2>
            <p className="text-gray-500 text-sm sm:text-lg max-w-2xl">
              Explore our fresh selection delivered to your door.
            </p>
          </div>
        </motion.div>
      </div>

      <div
        className="max-w-7xl mx-auto relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="hidden sm:block">
          <AnimatePresence>
            {currentIndex > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handlePrev}
                className="absolute -left-4 lg:-left-7 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-14 lg:h-14 bg-white shadow-xl border border-gray-100 rounded-full flex items-center justify-center text-gray-800 hover:text-green-600 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {currentIndex < maxIndex && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleNext}
                className="absolute -right-4 lg:-right-7 top-1/2 -translate-y-1/2 z-30 w-10 h-10 lg:w-14 lg:h-14 bg-white shadow-xl border border-gray-100 rounded-full flex items-center justify-center text-gray-800 hover:text-green-600 transition-colors"
              >
                <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-visible sm:overflow-hidden px-1">
          <motion.div
            className="flex gap-3 sm:gap-5"
            animate={{ x: `-${currentIndex * (100 / itemsPerView)}%` }}
            transition={{ type: "spring" as const, stiffness: 120, damping: 20 }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0"
                style={{ width: `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * (itemsPerView === 2 ? 12 : 20)) / itemsPerView}px)` }}
              >
                <CategoryCard
                  category={category}
                  onClick={() => onCategorySelect?.(category)}
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex sm:hidden justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? "w-6 bg-green-500" : "w-2 bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
