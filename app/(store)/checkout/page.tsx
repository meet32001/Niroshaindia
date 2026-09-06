"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Plus,
  MapPin,
  CheckCircle2,
  Loader2,
  Lock,
  User,
  Phone,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import { Container } from "@/components/layout/Container";
import { Title } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { useStore } from "@/store";
import { useIsMounted } from "@/hooks/useIsMounted";
import { getUserAddresses, saveAddress } from "@/actions/address";
import { createCheckoutSession } from "@/actions/createCheckoutSession";
import { addressSchema, AddressInput } from "@/lib/validations/address";
import { verifyIndianPincode } from "@/lib/services/pincode";
import { INDIAN_STATES, getAvailableCities } from "@/lib/constants/regions";
import { urlFor } from "@/lib/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { items, getTotalPrice, getSubtotalPrice } = useStore();
  const isMounted = useIsMounted();

  // Address state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // PIN Code Verification State
  const [pinLoading, setPinLoading] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Dynamic Custom Cities (for PIN lookups that return cities outside default lists)
  const [customCities, setCustomCities] = useState<string[]>([]);

  // Address Form State
  const [formAddress, setFormAddress] = useState<AddressInput>({
    recipient_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: "",
    is_default: false,
  });

  // Available cities based on selected state
  const baseCities = getAvailableCities(formAddress.state);
  const availableCities = Array.from(new Set([...baseCities, ...customCities]));

  // Restore guest draft from sessionStorage on mount
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem("checkout_guest_address");
      if (draft) {
        const parsed = JSON.parse(draft);
        setFormAddress({ ...parsed, country: "India" });
        if (parsed.postal_code && /^[1-9][0-9]{5}$/.test(parsed.postal_code)) {
          setPinVerified(true);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Fetch saved addresses if signed in
  useEffect(() => {
    if (!isLoaded) return;
    let isMountedFlag = true;

    if (isSignedIn) {
      getUserAddresses().then((res) => {
        if (!isMountedFlag) return;
        if (res.success && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const defaultAddr = res.addresses.find((a: any) => a.is_default || a.is_default_shipping);
          setSelectedAddressId(defaultAddr ? defaultAddr.id : res.addresses[0].id);
        } else {
          setShowAddForm(true);
        }
        setLoadingAddresses(false);
      });
    } else {
      setShowAddForm(true);
      setLoadingAddresses(false);
    }

    return () => {
      isMountedFlag = false;
    };
  }, [isLoaded, isSignedIn]);

  // Handle PIN Code Auto-Fill & Lookup
  const handlePincodeChange = async (newPin: string) => {
    setFormAddress((prev) => ({ ...prev, postal_code: newPin }));
    const cleanPin = newPin.trim();

    if (cleanPin.length === 6) {
      if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
        setPinError("Please enter a valid 6-digit Indian PIN code.");
        setPinVerified(false);
        return;
      }

      setPinLoading(true);
      setPinError(null);
      const res = await verifyIndianPincode(cleanPin);
      setPinLoading(false);

      if (res.isValid && res.city && res.state) {
        // Match or find closest State in INDIAN_STATES
        const matchedState = INDIAN_STATES.find(
          (s) => s.toLowerCase() === res.state!.toLowerCase()
        ) || res.state!;

        // Add custom city if missing from master list
        const stateCities = getAvailableCities(matchedState);
        if (res.city && !stateCities.includes(res.city)) {
          setCustomCities((prev) => Array.from(new Set([...prev, res.city!])));
        }

        setFormAddress((prev) => ({
          ...prev,
          state: matchedState,
          city: res.city!,
          country: "India",
        }));
        setPinVerified(true);
        setPinError(null);
        toast.success(`PIN verified: ${res.city}, ${matchedState}`);
      } else {
        setPinVerified(false);
        setPinError(res.error || "Invalid PIN code. No postal office found in India.");
        toast.error("Invalid PIN code. Please enter a valid Indian PIN code.");
      }
    } else {
      setPinVerified(false);
      setPinError(null);
    }
  };

  const handleStateChange = (newState: string) => {
    setFormAddress((prev) => ({
      ...prev,
      state: newState,
      city: "", // reset city when state changes
    }));
  };

  if (!isLoaded || !isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-shop-orange" />
        <span className="text-xs font-semibold text-slate-500">Preparing checkout...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/40 text-shop-orange flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8" />
        </div>
        <Title className="text-2xl font-black">Your Cart is Empty</Title>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link href="/shop">
          <Button className="bg-shop-orange hover:bg-amber-600 text-white font-bold rounded-xl gap-2">
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </Container>
    );
  }

  const totalPrice = getTotalPrice();
  const subtotalPrice = getSubtotalPrice();
  const totalSavings = Math.max(0, subtotalPrice - totalPrice);

  const getImageUrl = (img: unknown) => {
    if (!img) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
    if (typeof img === "string") return img;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((img as any)?.asset) {
      try {
        return urlFor(img).url();
      } catch {
        return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
      }
    }
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
  };

  const handleSaveInlineAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pinError) {
      toast.error(pinError);
      return;
    }

    const payload = { ...formAddress, country: "India" };
    const result = addressSchema.safeParse(payload);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Please complete address details");
      return;
    }

    if (isSignedIn) {
      setSavingAddress(true);
      const res = await saveAddress(payload);
      setSavingAddress(false);

      if (res.success && res.address) {
        toast.success("Address saved successfully!");
        setSavedAddresses((prev) => [res.address, ...prev]);
        setSelectedAddressId(res.address.id);
        setShowAddForm(false);
      } else {
        toast.error(res.error || "Failed to save address");
      }
    } else {
      sessionStorage.setItem("checkout_guest_address", JSON.stringify(payload));
      toast.success("Delivery address drafted!");
      setShowAddForm(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!isSignedIn) {
      sessionStorage.setItem("checkout_guest_address", JSON.stringify({ ...formAddress, country: "India" }));
      toast.error("Please sign in to complete your order");
      router.push("/sign-in?redirect=/checkout");
      return;
    }

    let targetAddress = savedAddresses.find((a) => a.id === selectedAddressId);

    if (!targetAddress && showAddForm) {
      const payload = { ...formAddress, country: "India" };
      const validation = addressSchema.safeParse(payload);
      if (!validation.success) {
        toast.error(validation.error.issues[0]?.message || "Please complete valid shipping address");
        return;
      }
      targetAddress = payload;
    }

    if (!targetAddress && savedAddresses.length > 0) {
      targetAddress = savedAddresses[0];
    }

    if (!targetAddress) {
      toast.error("Please select or enter a valid delivery address");
      return;
    }

    try {
      setIsProcessingPayment(true);
      const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const metadata = {
        orderNumber,
        customerName: targetAddress.recipient_name || user?.fullName || "Customer",
        customerEmail: user?.primaryEmailAddress?.emailAddress || "",
        clerkUserId: user?.id || "",
        address: { ...targetAddress, country: "India" },
      };

      const checkoutUrl = await createCheckoutSession(items, metadata);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to initialize Stripe checkout session");
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("An error occurred during payment setup");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 min-h-screen pb-24">
      <Container className="py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Link
            href="/cart"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <Title className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Checkout & Delivery
            </Title>
            <p className="text-xs text-slate-500 font-medium">
              Review your items and specify delivery details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Address Selection / Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-shop-orange" />
                    <span>Shipping Address</span>
                  </CardTitle>

                  {isSignedIn && savedAddresses.length > 0 && !showAddForm && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(true)}
                      className="text-xs gap-1.5 font-semibold rounded-xl"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                {/* 1. Logged-in Saved Address List */}
                {isSignedIn && !showAddForm && savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-shop-orange bg-orange-50/20 dark:bg-orange-950/20 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>{addr.recipient_name || addr.full_name}</span>
                              </h4>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-shop-orange shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {addr.address_line1 || addr.street_address}
                            </p>
                            {addr.address_line2 && (
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                {addr.address_line2}
                              </p>
                            )}
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              {addr.city}, {addr.state} - {addr.postal_code}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{addr.phone}</span>
                            </p>
                          </div>

                          {(addr.is_default || addr.is_default_shipping) && (
                            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                              <Badge className="bg-emerald-600 text-white text-[9px]">
                                Default Address
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Add New / Guest Address Form */}
                {(showAddForm || savedAddresses.length === 0 || !isSignedIn) && (
                  <form onSubmit={handleSaveInlineAddress} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="recipient_name" className="text-xs font-semibold">
                        Full Name / Recipient Name *
                      </Label>
                      <Input
                        id="recipient_name"
                        value={formAddress.recipient_name}
                        onChange={(e) =>
                          setFormAddress({ ...formAddress, recipient_name: e.target.value })
                        }
                        placeholder="John Doe"
                        required
                        className="rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="address_line1" className="text-xs font-semibold">
                        Address Line 1 (Flat, House No, Building, Street) *
                      </Label>
                      <Input
                        id="address_line1"
                        value={formAddress.address_line1}
                        onChange={(e) =>
                          setFormAddress({ ...formAddress, address_line1: e.target.value })
                        }
                        placeholder="123 Main Street, Apt 4B"
                        required
                        className="rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="address_line2" className="text-xs font-semibold">
                        Address Line 2 (Landmark / Area / Suite)
                      </Label>
                      <Input
                        id="address_line2"
                        value={formAddress.address_line2 || ""}
                        onChange={(e) =>
                          setFormAddress({ ...formAddress, address_line2: e.target.value })
                        }
                        placeholder="Near City Park"
                        className="rounded-xl text-sm"
                      />
                    </div>

                    {/* PIN Code Verification Row */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="postal_code" className="text-xs font-semibold">
                          PIN Code (6 Digits) *
                        </Label>
                        {pinLoading && (
                          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Verifying PIN code...</span>
                          </span>
                        )}
                        {pinVerified && !pinLoading && (
                          <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="postal_code"
                        value={formAddress.postal_code}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 395007 or 380015"
                        maxLength={6}
                        required
                        className={`rounded-xl text-sm ${
                          pinError
                            ? "border-rose-500 focus-visible:ring-rose-500"
                            : pinVerified
                            ? "border-emerald-500 focus-visible:ring-emerald-500"
                            : ""
                        }`}
                      />
                      {pinError && (
                        <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 pt-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>{pinError}</span>
                        </p>
                      )}
                    </div>

                    {/* State & City Dropdown Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="state" className="text-xs font-semibold">
                          State *
                        </Label>
                        <select
                          id="state"
                          value={formAddress.state}
                          onChange={(e) => handleStateChange(e.target.value)}
                          required
                          className="w-full h-10 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-shop-orange"
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((stateName) => (
                            <option key={stateName} value={stateName}>
                              {stateName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="city" className="text-xs font-semibold">
                          City / District *
                        </Label>
                        <select
                          id="city"
                          value={formAddress.city}
                          onChange={(e) =>
                            setFormAddress({ ...formAddress, city: e.target.value })
                          }
                          disabled={!formAddress.state}
                          required
                          className="w-full h-10 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-shop-orange"
                        >
                          <option value="">
                            {formAddress.state ? "Select City / District" : "Select State First"}
                          </option>
                          {availableCities.map((cityName) => (
                            <option key={cityName} value={cityName}>
                              {cityName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Fixed Locked Country Field */}
                    <div className="space-y-1">
                      <Label htmlFor="country" className="text-xs font-semibold">
                        Country (Fixed)
                      </Label>
                      <Input
                        id="country"
                        value="India"
                        readOnly
                        disabled
                        className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500 rounded-xl text-sm font-medium border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs font-semibold">
                        Mobile Phone (10 Digits) *
                      </Label>
                      <Input
                        id="phone"
                        value={formAddress.phone}
                        onChange={(e) =>
                          setFormAddress({ ...formAddress, phone: e.target.value })
                        }
                        placeholder="9876543210"
                        maxLength={10}
                        required
                        className="rounded-xl text-sm"
                      />
                    </div>

                    {isSignedIn && (
                      <div className="flex items-center space-x-2 pt-1">
                        <Checkbox
                          id="is_default"
                          checked={formAddress.is_default}
                          onCheckedChange={(checked) =>
                            setFormAddress({ ...formAddress, is_default: !!checked })
                          }
                        />
                        <Label htmlFor="is_default" className="text-xs font-normal">
                          Save as default delivery address
                        </Label>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2">
                      {savedAddresses.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowAddForm(false)}
                          className="text-xs rounded-xl"
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={savingAddress || pinLoading || !!pinError}
                        className="bg-shop-orange hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs"
                      >
                        {savingAddress && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                        <span>{isSignedIn ? "Save Address" : "Confirm Delivery Address"}</span>
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Unauthenticated Alert Banner */}
            {!isSignedIn && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">
                    Sign in Checkpoint Required for Payment
                  </h4>
                  <p className="text-amber-700 dark:text-amber-300">
                    You can draft your shipping address now. Clicking <strong>Proceed to Payment</strong> will securely prompt sign-in via Clerk before initiating payment.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-4">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 p-6 sticky top-24">
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold text-slate-500">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </h2>

              {/* Items List Snapshot */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((cartItem) => {
                  const product = cartItem.product;
                  const productId = product?._id || product?.id || "";
                  const name = product?.name || "Product Name";
                  const price = product?.price || 0;
                  const image = getImageUrl(product?.images?.[0] || product?.image);

                  return (
                    <div key={productId} className="pt-2 flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800">
                        <Image src={image} alt={name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{name}</h4>
                        <p className="text-slate-500">Qty: {cartItem.quantity}</p>
                      </div>
                      <PriceFormatter amount={price * cartItem.quantity} className="font-bold text-xs text-slate-900 dark:text-slate-100" />
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation */}
              <div className="space-y-2.5 text-xs font-medium border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <PriceFormatter amount={subtotalPrice} className="font-bold text-slate-900 dark:text-slate-100" />
                </div>

                {totalSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Discount Savings</span>
                    <span>-<PriceFormatter amount={totalSavings} /></span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-600">FREE Delivery</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Estimated GST (Included)</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">₹0</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-extrabold text-slate-900 dark:text-slate-100">
                  <span>Total Payable</span>
                  <PriceFormatter amount={totalPrice} className="text-lg font-black text-shop-orange" />
                </div>
              </div>

              {/* Proceed to Payment CTA */}
              <Button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isProcessingPayment || loadingAddresses || pinLoading || !!pinError}
                className="w-full bg-shop-orange hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting to Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Encrypted 256-Bit SSL Payment Security</span>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
