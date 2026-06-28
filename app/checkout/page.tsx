"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressCard from "@/components/AddressCard";
import { Address } from "@/types";
import { supabase } from "@/lib/supabase";
import { formatINR } from "@/lib/utils";
import { 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Plus, 
  RefreshCw, 
  Check, 
  ChevronLeft,
  Smartphone,
  CheckCircle2,
  Lock
} from "lucide-react";
import { toast } from "sonner";

// Preset UPI applications for simulated checks
const UPI_APPS = [
  { id: "gpay", name: "Google Pay", icon: "https://images.unsplash.com/photo-1612144431180-2d672779556c?w=100", hex: "#4285F4" },
  { id: "phonepe", name: "PhonePe", icon: "https://images.unsplash.com/photo-1612144431180-2d672779556c?w=100", hex: "#5F259F" },
  { id: "paytm", name: "Paytm", icon: "https://images.unsplash.com/photo-1612144431180-2d672779556c?w=100", hex: "#00B9F5" },
  { id: "bhim", name: "BHIM UPI", icon: "https://images.unsplash.com/photo-1612144431180-2d672779556c?w=100", hex: "#E96E2E" }
];

function CheckoutContent() {
  const { user, cart, refreshCart } = useApp();
  const router = useRouter();

  // Step trackers
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Address inputs
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrSaving, setAddrSaving] = useState(false);

  // Promo/Discounts parsed from cart state
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("");
  const [upiId, setUpiId] = useState("");
  const [showMockGateway, setShowMockGateway] = useState(false);
  const [mockOrderId, setMockOrderId] = useState("");

  // Stepper calculations
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = subtotal >= 499 || subtotal === 0 ? 0 : 99;
  const discountAmount = subtotal * discountPercent;
  const total = subtotal + shippingFee - discountAmount;

  // Initial load
  useEffect(() => {
    if (!user) {
      toast.error("Please login to proceed to checkout!");
      router.push("/login?redirect=/checkout");
      return;
    }

    // Load discount if set
    const savedDiscount = sessionStorage.getItem("applied_discount_percent");
    const savedCoupon = sessionStorage.getItem("applied_coupon_code");
    if (savedDiscount) setDiscountPercent(parseFloat(savedDiscount));
    if (savedCoupon) setCouponCode(savedCoupon);

    fetchAddresses();
    loadRazorpayScript();
  }, [user]);

  const loadRazorpayScript = () => {
    const scriptId = "razorpay-checkout-js";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);

    // Mock session address loader
    if (user.id.startsWith("mock-")) {
      const stored = localStorage.getItem(`addresses_${user.id}`);
      if (stored) {
        const addrList = JSON.parse(stored);
        setAddresses(addrList);
        const def = addrList.find((a: Address) => a.is_default);
        if (def) setSelectedAddressId(def.id);
        else if (addrList.length > 0) setSelectedAddressId(addrList[0].id);
      } else {
        // Mock fallback address item
        const defaultMockAddr: Address = {
          id: "addr_mock_1",
          user_id: user.id,
          name: "Aisha Patel",
          phone: user.phone || "+919876543210",
          line1: "Flat 405, Rose Mansion, Outer Ring Road",
          line2: "Near Maple Heights",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560103",
          is_default: true,
        };
        setAddresses([defaultMockAddr]);
        setSelectedAddressId(defaultMockAddr.id);
        localStorage.setItem(`addresses_${user.id}`, JSON.stringify([defaultMockAddr]));
      }
      setLoadingAddresses(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        setAddresses(data);
        const def = data.find((a) => a.is_default);
        if (def) setSelectedAddressId(def.id);
        else if (data.length > 0) setSelectedAddressId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!addrPincode || addrPincode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setAddrSaving(true);

    const newAddr: Omit<Address, "id"> = {
      user_id: user.id,
      name: addrName,
      phone: addrPhone,
      line1: addrLine1,
      line2: addrLine2 || null,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      is_default: addresses.length === 0, // Set default if it's the first address
    };

    if (user.id.startsWith("mock-")) {
      const mockAddrWithId: Address = {
        ...newAddr,
        id: `addr_mock_${Date.now()}`
      };
      const updated = [...addresses, mockAddrWithId];
      setAddresses(updated);
      setSelectedAddressId(mockAddrWithId.id);
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
      toast.success("Billing address added!");
      resetAddressForm();
      setAddrSaving(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert(newAddr)
        .select()
        .single();

      if (error) throw error;

      toast.success("Billing address saved! ✨");
      if (data) {
        setAddresses((prev) => [...prev, data]);
        setSelectedAddressId(data.id);
      }
      resetAddressForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setAddrSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddrName("");
    setAddrPhone("");
    setAddrLine1("");
    setAddrLine2("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setShowAddressForm(false);
  };

  const handleCheckoutSubmit = async () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      toast.error("Please select a delivery address to continue!");
      return;
    }

    setPaymentLoading(true);

    try {
      // Create Razorpay transaction order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      if (orderData.is_mocked) {
        // Trigger simulated UI payment modal
        setMockOrderId(orderData.id);
        setShowMockGateway(true);
        setPaymentLoading(false);
        return;
      }

      // Execute actual Razorpay script popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Kushvi Closet",
        description: `Styling Order: ${cart.length} items`,
        order_id: orderData.id,
        handler: async function (response: any) {
          setPaymentLoading(true);
          try {
            // Verify payment on server
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user?.id,
                items: cart.map((item) => ({
                  product_id: item.product_id,
                  name: item.product?.name,
                  size: item.size,
                  color: item.color,
                  qty: item.quantity,
                  price: item.product?.price,
                  image: item.product?.images?.[0]
                })),
                subtotal,
                shipping_fee: shippingFee,
                total_amount: total,
                shipping_address: selectedAddress,
                vendor_id: cart[0]?.product?.vendor_id || null,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              sessionStorage.removeItem("applied_discount_percent");
              sessionStorage.removeItem("applied_coupon_code");
              
              // Force clean local cart memory for mock user
              if (user?.id.startsWith("mock-")) {
                localStorage.removeItem(`cart_${user.id}`);
              }
              router.push(`/order-success/${verifyData.order.id}`);
            } else {
              throw new Error(verifyData.error || "Verification failed");
            }
          } catch (verErr: any) {
            toast.error(verErr.message || "Payment verification failed. Please contact support.");
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#F2A7BB",
        },
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || "Failed to trigger payment gate");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleMockPaymentSuccess = async () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress || !user) return;

    if (selectedUpiApp === "" && !upiId.trim()) {
      toast.error("Please choose a UPI app or fill in your UPI ID");
      return;
    }

    setPaymentLoading(true);
    setShowMockGateway(false);

    try {
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
          razorpay_order_id: mockOrderId,
          user_id: user.id,
          items: cart.map((item) => ({
            product_id: item.product_id,
            name: item.product?.name,
            size: item.size,
            color: item.color,
            qty: item.quantity,
            price: item.product?.price,
            image: item.product?.images?.[0]
          })),
          subtotal,
          shipping_fee: shippingFee,
          total_amount: total,
          shipping_address: selectedAddress,
          vendor_id: cart[0]?.product?.vendor_id || null,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        sessionStorage.removeItem("applied_discount_percent");
        sessionStorage.removeItem("applied_coupon_code");
        
        // Clean local mock cart
        localStorage.removeItem(`cart_${user.id}`);
        router.push(`/order-success/${verifyData.order.id}`);
      } else {
        throw new Error(verifyData.error || "Verification failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Mock payment processing failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1">
        
        {/* Checkout Header Steps */}
        <div className="flex items-center justify-between border-b border-border pb-6 mb-8 gap-4">
          <h1 className="font-heading italic text-3xl text-text-primary">Checkout</h1>
          
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            <span className={step === 1 ? "text-primary-dark font-bold underline" : ""}>1. Address</span>
            <span>&rarr;</span>
            <span className={step === 2 ? "text-primary-dark font-bold underline" : ""}>2. Summary</span>
            <span>&rarr;</span>
            <span className={step === 3 ? "text-primary-dark font-bold underline" : ""}>3. Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form / Selectors */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* STEP 1: Address Manager */}
            {step === 1 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading italic text-xl font-bold text-text-primary">
                    Delivery Address
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary-dark border border-primary-dark/30 rounded-full px-3.5 py-1.5 hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                </div>

                {/* Form to add address */}
                {showAddressForm && (
                  <form onSubmit={handleCreateAddress} className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4 animate-fade-in">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2">
                      New Delivery Address
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Contact Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Aisha Patel"
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Address Line 1</label>
                      <input
                        type="text"
                        required
                        placeholder="Flat No, House Name, Building, Street Address"
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        placeholder="Landmark, Locality, Area"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">City</label>
                        <input
                          type="text"
                          required
                          placeholder="Bengaluru"
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">State</label>
                        <input
                          type="text"
                          required
                          placeholder="Karnataka"
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="560103"
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="px-4 py-2 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-text-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addrSaving}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {addrSaving ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses lists */}
                {loadingAddresses ? (
                  <div className="flex justify-center p-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        isSelected={selectedAddressId === addr.id}
                        onSelect={() => setSelectedAddressId(addr.id)}
                        selectable
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-surface border border-border rounded-card">
                    <p className="text-sm text-text-secondary mb-4">No saved addresses found.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider"
                    >
                      Create First Address
                    </button>
                  </div>
                )}

                {/* Navigation actions */}
                <div className="mt-8 border-t border-border pt-6 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedAddressId}
                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    Continue to Summary &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Summary preview */}
            {step === 2 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <h3 className="font-heading italic text-xl font-bold text-text-primary">
                  Review Order Items
                </h3>

                {/* Order items lists */}
                <div className="bg-surface border border-border rounded-card shadow-soft overflow-hidden divide-y divide-border">
                  {cart.map((item) => {
                    const price = item.product?.price || 0;
                    return (
                      <div key={item.id} className="p-4 flex gap-4 items-center">
                        <div className="relative w-12 h-16 rounded-btn overflow-hidden bg-secondary/10 flex-shrink-0">
                          <Image
                            src={item.product?.images?.[0] || ""}
                            alt={item.product?.name || ""}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-text-primary truncate">{item.product?.name}</h4>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-bold text-sm text-text-primary">
                          {formatINR(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Address Display Card */}
                <div className="bg-surface border border-border rounded-card p-5 shadow-soft">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-dark" /> Ship To Address
                  </h4>
                  {addresses.find((a) => a.id === selectedAddressId) && (
                    <div className="text-xs text-text-secondary leading-relaxed">
                      <p className="font-semibold text-text-primary text-sm">{addresses.find((a) => a.id === selectedAddressId)?.name}</p>
                      <p>{addresses.find((a) => a.id === selectedAddressId)?.phone}</p>
                      <p>{addresses.find((a) => a.id === selectedAddressId)?.line1}</p>
                      {addresses.find((a) => a.id === selectedAddressId)?.line2 && (
                        <p>{addresses.find((a) => a.id === selectedAddressId)?.line2}</p>
                      )}
                      <p>
                        {addresses.find((a) => a.id === selectedAddressId)?.city}, {addresses.find((a) => a.id === selectedAddressId)?.state} - {addresses.find((a) => a.id === selectedAddressId)?.pincode}
                      </p>
                    </div>
                  )}
                </div>

                {/* Nav actions */}
                <div className="mt-8 border-t border-border pt-6 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 px-4 py-2 border border-border hover:bg-background text-text-secondary rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Edit Address
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Proceed to Payment &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment select */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <h3 className="font-heading italic text-xl font-bold text-text-primary">
                  Select Payment Method
                </h3>

                <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-6">
                  
                  {/* Warning label showing UPI only */}
                  <div className="bg-primary/5 border border-primary/20 text-primary-dark rounded-btn p-4 text-xs flex items-start gap-2.5">
                    <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">UPI Only Enabled</strong>
                      To streamline dropshipping checkouts and minimize shipping processing delays, we only accept payments via UPI Apps and UPI IDs.
                    </div>
                  </div>

                  {/* UPI Apps Grid */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mb-3">
                      UPI Applications
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {UPI_APPS.map((app) => {
                        const active = selectedUpiApp === app.id;
                        return (
                          <button
                            key={app.id}
                            onClick={() => {
                              setSelectedUpiApp(app.id);
                              setUpiId(""); // Clear custom ID
                            }}
                            className={`flex flex-col items-center justify-center p-4 border rounded-btn transition-all ${
                              active
                                ? "border-primary-dark bg-primary/5 ring-2 ring-primary/20 scale-102 font-bold"
                                : "border-border bg-background hover:border-primary-dark/45"
                            }`}
                          >
                            <span 
                              className="w-1.5 h-1.5 rounded-full absolute top-2 right-2"
                              style={{ backgroundColor: app.hex }}
                            />
                            <Smartphone className="w-6 h-6 text-text-secondary mb-2" />
                            <span className="text-xs text-text-primary">{app.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* UPI ID input alternative */}
                  <div className="border-t border-border/75 pt-5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary mb-3">
                      Or Pay Using UPI ID
                    </h4>
                    <div className="flex bg-background border border-border rounded-input px-3 py-2.5 max-w-sm focus-within:border-primary transition-colors">
                      <input
                        type="text"
                        placeholder="e.g. mobile@upi"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setSelectedUpiApp(""); // Clear app preset
                        }}
                        className="bg-transparent border-0 outline-none w-full text-xs text-text-primary"
                      />
                    </div>
                  </div>

                  {/* Security label */}
                  <div className="text-[10px] text-text-secondary flex items-center gap-1.5 mt-2">
                    <Lock className="w-3.5 h-3.5 text-success" />
                    <span>Transactions are secured via Razorpay AES-256 encryption.</span>
                  </div>

                </div>

                {/* Navigation actions */}
                <div className="mt-8 border-t border-border pt-6 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1 px-4 py-2 border border-border hover:bg-background text-text-secondary rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Edit Order
                  </button>
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={paymentLoading || (!selectedUpiApp && !upiId.trim())}
                    className="px-10 py-4 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 shadow-soft"
                  >
                    {paymentLoading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : null}
                    <span>Pay {formatINR(total)}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="bg-surface border border-border rounded-card p-6 shadow-soft">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-4 mb-4">
                Summary details
              </h3>

              <div className="flex flex-col gap-3.5 text-sm text-text-secondary border-b border-border pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-text-primary font-medium">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? "FREE" : formatINR(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount applied ({couponCode})</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-text-primary">Payable Amount</span>
                <span className="text-xl font-extrabold text-primary-dark font-heading italic">
                  {formatINR(total)}
                </span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Simulated UPI Gateway Dialog Modal */}
      {showMockGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/45 backdrop-blur-sm animate-fade-in font-body">
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft max-w-sm w-full relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-primary-dark" />
              </div>
              <h3 className="font-heading italic text-xl font-bold text-text-primary">
                Mock UPI Gateway
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Select app to simulate a successful UPI transaction
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {UPI_APPS.map((app) => {
                  const active = selectedUpiApp === app.id;
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        setSelectedUpiApp(app.id);
                        setUpiId("");
                      }}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-btn text-xs font-semibold text-left transition-colors ${
                        active 
                          ? "border-primary-dark bg-primary/5 font-bold" 
                          : "border-border bg-background hover:bg-border/30"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-text-secondary" />
                      <span>{app.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4">
                <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1">Or UPI ID</label>
                <input
                  type="text"
                  placeholder="name@upi"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setSelectedUpiApp("");
                  }}
                  className="w-full border border-border rounded-input p-2 text-xs outline-none bg-background focus:border-primary text-text-primary"
                />
              </div>

              <div className="bg-primary/5 rounded p-3 text-[10px] text-text-secondary border border-primary/15 leading-normal flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Simulating checks for: <strong>{formatINR(total)}</strong>. Order will resolve immediately to order-success page.</span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => {
                    setShowMockGateway(false);
                    setSelectedUpiApp("");
                    setUpiId("");
                  }}
                  className="flex-1 py-2 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-text-secondary text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMockPaymentSuccess}
                  className="flex-1 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider text-center transition-colors shadow-soft"
                >
                  Simulate Pay
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
