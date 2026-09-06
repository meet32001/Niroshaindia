"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUserAddresses,
  saveAddress,
  deleteAddress,
} from "@/actions/address";
import { AddressInput } from "@/lib/validations/address";
import { verifyIndianPincode } from "@/lib/services/pincode";
import { INDIAN_STATES, getAvailableCities } from "@/lib/constants/regions";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, MapPin, Edit, Trash2, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AddressBookPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressInput | null>(null);

  // PIN Code Verification State
  const [pinLoading, setPinLoading] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Dynamic Custom Cities
  const [customCities, setCustomCities] = useState<string[]>([]);

  const [formData, setFormData] = useState<AddressInput>({
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

  const baseCities = getAvailableCities(formData.state);
  const availableCities = Array.from(new Set([...baseCities, ...customCities]));

  const fetchAddresses = async () => {
    setLoading(true);
    const res = await getUserAddresses();
    if (res.success) {
      setAddresses(res.addresses);
    } else {
      toast.error(res.error || "Failed to load addresses");
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    getUserAddresses().then((res) => {
      if (!isMounted) return;
      if (res.success) {
        setAddresses(res.addresses);
      } else {
        toast.error(res.error || "Failed to load addresses");
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle PIN Code Verification & Auto-Fill
  const handlePincodeChange = async (newPin: string) => {
    setFormData((prev) => ({ ...prev, postal_code: newPin }));
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
        const matchedState = INDIAN_STATES.find(
          (s) => s.toLowerCase() === res.state!.toLowerCase()
        ) || res.state!;

        const stateCities = getAvailableCities(matchedState);
        if (res.city && !stateCities.includes(res.city)) {
          setCustomCities((prev) => Array.from(new Set([...prev, res.city!])));
        }

        setFormData((prev) => ({
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
    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: "",
    }));
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setPinVerified(false);
    setPinError(null);
    setFormData({
      recipient_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      phone: "",
      is_default: addresses.length === 0,
    });
    setDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEdit = (addr: any) => {
    setEditingAddress(addr);
    setPinVerified(true);
    setPinError(null);
    setFormData({
      id: addr.id,
      recipient_name: addr.recipient_name || addr.full_name || "",
      address_line1: addr.address_line1 || addr.street_address || "",
      address_line2: addr.address_line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: "India",
      phone: addr.phone || "",
      is_default: !!addr.is_default || !!addr.is_default_shipping,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinError) {
      toast.error(pinError);
      return;
    }

    setSaving(true);
    const payload = { ...formData, country: "India" };
    const res = await saveAddress(payload);
    setSaving(false);

    if (res.success) {
      toast.success(editingAddress ? "Address updated" : "Address added");
      setDialogOpen(false);
      fetchAddresses();
    } else {
      toast.error(res.error || "Failed to save address");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const res = await deleteAddress(id);
    if (res.success) {
      toast.success("Address deleted");
      fetchAddresses();
    } else {
      toast.error(res.error || "Failed to delete address");
    }
  };

  return (
    <Container className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Address Book
            </h1>
            <p className="text-sm text-slate-500">
              Manage your saved shipping and billing addresses.
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                onClick={handleOpenAdd}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm rounded-xl font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </Button>
            }
          />
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  value={formData.recipient_name}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient_name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line1: e.target.value })
                  }
                  placeholder="123 Main Street, Apt 4B"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2 || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line2: e.target.value })
                  }
                  placeholder="Landmark / Suite"
                />
              </div>

              {/* PIN Code Verification Row */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="postal_code">PIN Code (6 Digits)</Label>
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
                  value={formData.postal_code}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="e.g. 395007 or 380015"
                  maxLength={6}
                  required
                  className={
                    pinError
                      ? "border-rose-500 focus-visible:ring-rose-500"
                      : pinVerified
                      ? "border-emerald-500 focus-visible:ring-emerald-500"
                      : ""
                  }
                />
                {pinError && (
                  <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 pt-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              {/* State & City Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                    className="w-full h-10 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  <Label htmlFor="city">City / District</Label>
                  <select
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!formData.state}
                    required
                    className="w-full h-10 px-3 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">
                      {formData.state ? "Select City / District" : "Select State First"}
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
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value="India"
                  readOnly
                  disabled
                  className="bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-500 rounded-xl text-sm font-medium border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Mobile Phone (10 Digits)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="9876543210"
                  maxLength={10}
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        is_default: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="is_default" className="text-sm font-normal">
                    Set as default delivery address
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || pinLoading || !!pinError}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Address
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <Card className="p-8 text-center border-dashed space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No saved addresses</h3>
            <p className="text-sm text-slate-500">
              Add your delivery address for faster checkout.
            </p>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Add Address
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className="relative border border-slate-200 dark:border-slate-800 hover:shadow-sm transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-semibold">
                    {addr.recipient_name || addr.full_name}
                  </CardTitle>
                  <div className="flex gap-1.5 flex-wrap">
                    {(addr.is_default || addr.is_default_shipping) && (
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        Default Address
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>{addr.address_line1 || addr.street_address}</p>
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>
                  {addr.city}, {addr.state} {addr.postal_code}
                </p>
                <p>{addr.country || "India"}</p>
                <p className="text-xs text-slate-400">Phone: {addr.phone}</p>

                <div className="flex items-center gap-3 pt-3 border-t">
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
