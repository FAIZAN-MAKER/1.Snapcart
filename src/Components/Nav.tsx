"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, X, LogOut, ChevronDown,
  ShoppingBasket, Package, Plus, List, ClipboardList, Menu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectCartCount } from "../redux/cartSlice";

interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "admin" | "user" | "deliveryBoy";
  image?: string;
}

const useClickOutside = (ref: React.RefObject<HTMLDivElement | null>, handler: () => void) => {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

const Avatar = ({ user, size = "md" }: { user: IUser | null; size?: "sm" | "md" | "lg" }) => {
  if (!user) {
    return <div className="w-9 h-9 bg-gray-200 rounded-xl" />;
  }
  const initials = useMemo(() =>
    user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?",
    [user.name]
  );
  const dims = { sm: 28, md: 36, lg: 64 };
  const cls = {
    sm: "w-7 h-7 text-xs rounded-lg",
    md: "w-9 h-9 text-sm rounded-xl",
    lg: "w-16 h-16 text-lg rounded-2xl",
  };
  if (user.image) {
    return <Image src={user.image} alt={user.name || "User"} width={dims[size]} height={dims[size]} className={`${cls[size]} object-cover`} />;
  }
  return (
    <div className={`${cls[size]} bg-green-500 flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
};

const AdminNavBtn = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
  <Link href={href}>
    <motion.div
      className="flex items-center gap-2 bg-white/10 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </motion.div>
  </Link>
);

const MenuItem = ({ children, onClick, className = "", href, icon }: {
  children: React.ReactNode; onClick?: () => void;
  className?: string; href?: string; icon?: React.ReactNode;
}) => {
  const inner = (
    <motion.div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition-colors ${className}`} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </motion.div>
  );
  if (href) return <Link href={href} onClick={onClick}>{inner}</Link>;
  return <div onClick={onClick}>{inner}</div>;
};

const adminLinks = [
  { href: "/admin/add-grocery", icon: Plus, label: "Add Grocery", desc: "Add new products" },
  { href: "/admin/view-grocery", icon: List, label: "View Grocery", desc: "Browse all products" },
  { href: "/admin/manage-orders", icon: ClipboardList, label: "Manage Orders", desc: "Track & update orders" },
];

const AdminSidebar = ({ user, open, onClose }: { user: IUser | null; open: boolean; onClose: () => void }) => {
  const initials = useMemo(() => user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?", [user?.name]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="fixed top-0 right-0 h-full w-[300px] bg-white z-50 flex flex-col shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring" as const, stiffness: 280, damping: 28 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-green-600" />
                <span className="font-bold text-gray-900 text-base">SnapCart</span>
              </div>
              <motion.button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" whileTap={{ scale: 0.9 }}>
                <X className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="mx-4 mt-4 mb-2 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
  <div className="flex items-center gap-3">
    {user?.image ? (
      <Image src={user.image} alt={user?.name ?? ""} width={48} height={48} className="w-12 h-12 rounded-xl object-cover ring-2 ring-green-200" />
    ) : (
      <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-base ring-2 ring-green-200">{initials}</div>
    )}
    <div className="min-w-0 flex-1">
      <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
      <p className="text-gray-500 text-xs truncate mt-0.5">{user?.email}</p>
      <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full">Admin</span>
    </div>
  </div>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Management</p>
              {adminLinks.map(({ href, icon: Icon, label, desc }, i) => (
                <motion.div key={href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, type: "spring" as const, stiffness: 220, damping: 22 }}>
                  <Link href={href} onClick={onClose}>
                    <motion.div className="flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors group" whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
                      <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-green-100 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4 text-gray-500 group-hover:text-green-600 transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-gray-400 group-hover:text-green-500 transition-colors">{desc}</p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-3 pb-6 pt-3 border-t border-gray-100">
              <motion.button onClick={() => { onClose(); signOut({ callbackUrl: "/login" }); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors group"
                whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Sign Out</p>
                  <p className="text-xs text-gray-400">See you next time</p>
                </div>
              </motion.button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ✅ Separate CartBadge component reads live count from Redux
const CartBadge = () => {
  const count = useSelector(selectCartCount);
  return (
    <Link href="/user/cart">
      <motion.div className="relative flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
        <ShoppingCart className="w-5 h-5" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              className="absolute -top-1.5 -right-1.5 bg-white text-emerald-600 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: "spring" as const, stiffness: 500 }}
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

const Nav = ({ user }: { user: IUser | null }) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const isDeliveryBoy = user?.role === "deliveryBoy";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  useEffect(() => {
    if (searchOpen) { const t = setTimeout(() => searchRef.current?.focus(), 50); return () => clearTimeout(t); }
  }, [searchOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setDropdownOpen(false); setSearchOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const handleSignOut = useCallback(() => { setDropdownOpen(false); signOut({ callbackUrl: "/login" }); }, []);
  const firstName = useMemo(() => user?.name?.split(" ")[0] || "User", [user?.name]);
  const springTransition = useMemo(() => ({ type: "spring" as const, stiffness: shouldReduceMotion ? 300 : 120, damping: shouldReduceMotion ? 30 : 18 }), [shouldReduceMotion]);

  return (
    <>
      <motion.nav className="sticky top-0 z-50 w-full will-change-transform" initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={springTransition} role="banner">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

            <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="SnapCart Home">
              <motion.div className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-white/20" whileHover={{ rotate: -12, scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring" as const, stiffness: 400, damping: 17 }}>
                <ShoppingBasket className="w-5 h-5 text-green-600" />
              </motion.div>
              <span className="text-white font-bold text-xl tracking-tight hidden sm:block group-hover:tracking-wider transition-all duration-300">SnapCart</span>
            </Link>

            {isAdmin && (
              <div className="hidden lg:flex items-center gap-2 flex-1 justify-center">
                <AdminNavBtn href="/admin/add-grocery" icon={Plus} label="Add Grocery" />
                <AdminNavBtn href="/admin/view-grocery" icon={List} label="View Grocery" />
                <AdminNavBtn href="/admin/manage-orders" icon={ClipboardList} label="Manage Orders" />
              </div>
            )}

            {isUser && (
              <>
                <motion.form className="hidden md:flex flex-1 max-w-lg items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 focus-within:bg-white/20 focus-within:border-white/40 transition-all duration-200" onSubmit={handleSearchSubmit} role="search">
                  <Search className="w-4 h-4 text-white/70 shrink-0" />
                  <input type="text" placeholder="Search groceries... (⌘K)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50 text-sm min-w-0" />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button type="button" onClick={() => setSearchQuery("")} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.form>
              </>
            )}

            <div className="flex items-center gap-2 sm:gap-3">
              {isUser && (
                <motion.button className="md:hidden w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors" onClick={() => setSearchOpen((p) => !p)} whileTap={{ scale: 0.9 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {searchOpen
                      ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" /></motion.div>
                      : <motion.div key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Search className="w-5 h-5" /></motion.div>
                    }
                  </AnimatePresence>
                </motion.button>
              )}

              {isUser && <CartBadge />}

              {isAdmin && (
                <motion.button className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors" onClick={() => setSidebarOpen(true)} whileTap={{ scale: 0.9 }}>
                  <Menu className="w-5 h-5" />
                </motion.button>
              )}

              <div className="relative" ref={dropdownRef}>
                <motion.button className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 rounded-xl px-2.5 py-1.5 transition-colors" onClick={() => setDropdownOpen((p) => !p)} whileTap={{ scale: 0.97 }} aria-expanded={dropdownOpen} aria-haspopup="true">
                  <Avatar user={user} size="sm" />
                  <span className="text-white text-sm font-medium hidden sm:block max-w-[100px] truncate">{firstName}</span>
                  <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-white/70">
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden z-50 origin-top-right"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring" as const, stiffness: 300, damping: 25 }} role="menu"
                    >
                      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50/50">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} size="md" />
                          <div className="min-w-0 flex-1">
                           <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
<p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                          </div>
                        </div>
                        <span className="inline-flex mt-3 text-[10px] font-semibold uppercase tracking-wider bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                          {user?.role === "deliveryBoy" ? "Delivery Partner" : user?.role}
                        </span>
                      </div>
                      <div className="p-2 space-y-0.5">
                        {isUser && (
                          <MenuItem href="/user/my-orders" onClick={() => setDropdownOpen(false)} className="text-gray-700 hover:bg-gray-50 hover:text-gray-900" icon={<Package className="w-4 h-4" />}>
                            My Orders
                          </MenuItem>
                        )}
                        <div className="h-px bg-gray-100 my-1" />
                        <MenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50" icon={<LogOut className="w-4 h-4" />}>
                          Sign Out
                        </MenuItem>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {isUser && (
            <AnimatePresence>
              {searchOpen && (
                <motion.div className="md:hidden px-4 pb-4" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}>
                  <form className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3" onSubmit={handleMobileSearchSubmit}>
                    <Search className="w-5 h-5 text-white/70 shrink-0" />
                    <input ref={searchRef} type="text" placeholder="Search groceries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50 text-base min-w-0" />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button type="button" onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                          <X className="w-5 h-5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.nav>
      {isAdmin && <AdminSidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    </>
  );
};

export default Nav;
