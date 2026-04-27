"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowLeft,
  Loader2,
  SearchX,
  ShoppingBag,
} from "lucide-react";
import { IGrocery } from "@/redux/cartSlice";
import GroceryItemCard from "@/Components/GroceryItemCard";
import Nav from "@/Components/Nav";
import Footer from "@/Components/Footer";

async function fetchSearchResults(query: string) {
  const res = await fetch(`/api/groceries/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.data || [];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<IGrocery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetchSearchResults(query)
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load results");
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="min-h-screen pb-20 font-poppins bg-white">
      <Nav user={null} />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mt-8 mb-6 flex items-center gap-4"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/">
              <button className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 px-4 py-2.5 rounded-2xl text-green-700 font-medium text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 text-green-600" />
                Back
              </button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                <Search size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Search Results
                </h1>
                {query && (
                  <p className="text-gray-500">
                    &ldquo;{query}&rdquo; &middot; {results.length} items found
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!query ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-700 font-medium">Enter a search term</p>
                <p className="text-gray-400 text-sm mt-1">Find your favorite groceries</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-500 text-sm">Searching...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <SearchX className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-gray-700 font-medium">{error}</p>
                <p className="text-gray-400 text-sm mt-1">Please try again</p>
              </motion.div>
            ) : results.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <SearchX className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-700 font-medium">No results found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try a different search term
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {results.map((item, index) => (
                  <GroceryItemCard key={item._id?.toString() || index} item={item} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}