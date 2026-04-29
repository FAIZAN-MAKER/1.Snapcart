"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, User, Phone,
  CreditCard, Banknote, ShoppingBag, Truck, ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import dynamic from "next/dynamic";
import {
  selectCartSubtotal, selectDeliveryFee, selectFinalTotal,
  selectCartItems, clearCart,
} from "../../../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";

interface AddressFields {
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
}

type PaymentMethod = "cod" | "stripe";

const MapSection = dynamic(() => import("./CheckoutMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <p className="text-sm font-medium">Loading map…</p>
      </div>
    </div>
  ),
});

const Field = ({ label, icon: Icon, value, onChange, placeholder, readOnly = false }: {
  label: string; icon: React.ElementType; value: string;
  onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    <div className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3 transition-colors ${
      readOnly ? "bg-gray-50 border-gray-100" : "bg-white border-gray-200 focus-within:border-green-400"
    }`}>
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <input type="text" value={value} onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder} readOnly={readOnly}
        className="flex-1 bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-300"
      />
    </div>
  </div>
);

const PaymentBtn = ({ selected, onClick, icon: Icon, label, sublabel }: {
  selected: boolean; onClick: () => void; icon: React.ElementType; label: string; sublabel: string;
}) => (
  <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.98 }}
    className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-colors ${
      selected ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-green-200"
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-green-500" : "bg-gray-100"}`}>
      <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-gray-500"}`} />
    </div>
    <div>
      <p className={`font-semibold text-sm ${selected ? "text-green-700" : "text-gray-800"}`}>{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
    </div>
    <AnimatePresence>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ml-auto shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.button>
);

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session, status } = useSession();

  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const finalTotal = useSelector(selectFinalTotal);
  const cartItems = useSelector(selectCartItems);

  const [address, setAddress] = useState<AddressFields>({ fullAddress: "", city: "", state: "", pincode: "" });
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [isLoading, setIsLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords([pos.coords.latitude, pos.coords.longitude]),
        () => setCoords([28.6139, 77.2090]),
      );
    } else {
      setCoords([28.6139, 77.2090]);
    }
  }, []);

  const handleMarkerMove = useCallback(async (lat: number, lng: number) => {
    setCoords([lat, lng]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const a = data.address ?? {};
      setAddress({
        fullAddress: data.display_name ?? "",
        city: a.city ?? a.town ?? a.village ?? a.county ?? "",
        state: a.state ?? "",
        pincode: a.postcode ?? "",
      });
    } catch { /* user can type manually */ }
  }, []);

  const buildPayload = () => ({
    items: cartItems.map((item) => ({
      grocery: item._id,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      image: item.image,
      unit: item.unit,
    })),
    totalAmount: finalTotal.toFixed(0),
    address: {
      fullName: session?.user?.name ?? "",
      mobile: (session?.user as any)?.mobile ?? "",
      city: address.city,
      state: address.state,
      pinCode: address.pincode,
      fullAddress: address.fullAddress,
      latitude: coords?.[0] ?? 0,
      longitude: coords?.[1] ?? 0,
    },
  });

  const validate = () => {
    if (!session?.user?.id) { setOrderError("User session expired. Please log in again."); return false; }
    if (!address.fullAddress) { setOrderError("Please pin your delivery location on the map."); return false; }
    if (cartItems.length === 0) { setOrderError("Your cart is empty."); return false; }
    return true;
  };

  // COD
  const handleCOD = async () => {
    if (!validate()) return;
    setOrderError("");
    setIsLoading(true);
    try {
      await axios.post("/api/user/order", { ...buildPayload(), paymentMethod: "cod" }, { withCredentials: true });
      dispatch(clearCart());
      router.push("/user/order-success");
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setOrderError(error.response?.data?.error ?? "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Stripe — creates order in DB then redirects to Stripe hosted checkout
  const handleStripe = async () => {
    if (!validate()) return;
    setOrderError("");
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/user/payment", {
        ...buildPayload(),
        paymentMethod: "online",
      }, { withCredentials: true });
      // Redirect to Stripe — cart cleared by webhook after payment
      window.location.href = data.url;
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setOrderError(error.response?.data?.error ?? "Failed to initiate payment. Please try again.");
      setIsLoading(false); // only reset on error; success = redirect
    }
  };

  const handleSubmit = () => paymentMethod === "cod" ? handleCOD() : handleStripe();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  const isDisabled = isLoading || cartItems.length === 0 || !address.fullAddress;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 16 } } };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-white pb-20 pt-8 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <motion.div className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 120, damping: 16 }}
        >
          <Link href="/user/cart">
            <motion.button whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-green-300 px-4 py-2.5 rounded-2xl text-gray-700 font-medium text-sm transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-green-600" /> Back to Cart
            </motion.button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Checkout</h1>
            <p className="text-gray-400 text-sm mt-0.5">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" variants={containerVariants} initial="hidden" animate="show">
          <div className="lg:col-span-7 space-y-6">

            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center"><User className="w-4 h-4 text-green-600" /></div>
                <div><h2 className="font-bold text-gray-900 text-base">Delivery Details</h2><p className="text-xs text-gray-400">Confirm your contact info</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <Field label="Full Name" icon={User} value={session?.user?.name ?? ""} readOnly />
                <Field label="Mobile" icon={Phone} value={(session?.user as any)?.mobile ?? ""} readOnly />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Full Address" icon={MapPin} value={address.fullAddress} onChange={(v) => setAddress((p) => ({ ...p, fullAddress: v }))} placeholder="Will be filled from map…" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="City" icon={MapPin} value={address.city} onChange={(v) => setAddress((p) => ({ ...p, city: v }))} placeholder="City" />
                  <Field label="State" icon={MapPin} value={address.state} onChange={(v) => setAddress((p) => ({ ...p, state: v }))} placeholder="State" />
                  <Field label="Pincode" icon={MapPin} value={address.pincode} onChange={(v) => setAddress((p) => ({ ...p, pincode: v }))} placeholder="Pincode" />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center"><MapPin className="w-4 h-4 text-green-600" /></div>
                <div><h2 className="font-bold text-gray-900 text-base">Pin Your Location</h2><p className="text-xs text-gray-400">Drag the marker or search to set your delivery address</p></div>
              </div>
              <div className="h-[380px] rounded-2xl overflow-hidden border border-gray-100">
                {coords && <MapSection initialCoords={coords} onMarkerMove={handleMarkerMove} />}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center"><CreditCard className="w-4 h-4 text-green-600" /></div>
                <div><h2 className="font-bold text-gray-900 text-base">Payment Method</h2><p className="text-xs text-gray-400">Choose how you'd like to pay</p></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <PaymentBtn selected={paymentMethod === "stripe"} onClick={() => setPaymentMethod("stripe")} icon={CreditCard} label="Pay Online" sublabel="Stripe — Cards & more" />
                <PaymentBtn selected={paymentMethod === "cod"} onClick={() => setPaymentMethod("cod")} icon={Banknote} label="Cash on Delivery" sublabel="Pay when order arrives" />
              </div>
              <AnimatePresence>
                {paymentMethod === "stripe" && (
                  <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
                      <CreditCard className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-700">Secure Stripe Payment</p>
                        <p className="text-xs text-blue-500 mt-0.5">You'll be redirected to Stripe's secure checkout. Your card details never touch our servers.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="lg:col-span-5 sticky top-6">
            <div className="bg-gray-950 text-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative border border-white/5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative"><ShoppingBag className="w-5 h-5 text-green-400" /> Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-48 overflow-y-auto pr-2 relative">
                {cartItems.map((item) => (
                  <div key={item._id?.toString()} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-xl shrink-0 overflow-hidden flex items-center justify-center border border-white/10">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-gray-200">{item.name}</p>
                      <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity} • {item.unit}</p>
                    </div>
                    <p className="text-sm font-bold shrink-0">Rs. {(parseFloat(item.price) * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/10 mb-5" />
              <div className="space-y-4 relative">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-medium">Subtotal</span>
                  <span className="font-bold text-gray-200">Rs. {subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm font-medium flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                  <span className={`font-bold ${deliveryFee === 0 ? "text-green-400" : "text-gray-200"}`}>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Payable</p>
                    <p className="text-[10px] text-green-400/80 font-bold tracking-widest uppercase mt-0.5">Secure Transaction</p>
                  </div>
                  <span className="text-3xl font-black">Rs. {finalTotal.toFixed(0)}</span>
                </div>

                <AnimatePresence>
                  {orderError && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-xs font-semibold"
                    >
                      {orderError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button onClick={handleSubmit} disabled={isDisabled}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}} whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 mt-1 transition-all ${
                    isDisabled ? "bg-gray-900 text-gray-600 cursor-not-allowed border border-white/5"
                      : "bg-green-500 hover:bg-green-400 text-gray-950 shadow-xl shadow-green-500/20"
                  }`}
                >
                  {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}<ChevronRight className="w-5 h-5" />
                </motion.button>

                {!address.fullAddress && !orderError && (
                  <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Pin location on map to continue</p>
                )}
                <div className="flex items-center justify-center gap-2 pt-1 opacity-50">
                  {paymentMethod === "cod" ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{paymentMethod === "cod" ? "Cash on Delivery" : "Powered by Stripe"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
