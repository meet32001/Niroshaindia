"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUserAddresses,
  saveAddress,
  deleteAddress,
  AddressInput,
} from "@/actions/address";
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
import { Plus, MapPin, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AddressBookPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressInput | null>(null);

  const [formData, setFormData] = useState<AddressInput>({
    full_name: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    phone: "",
    is_default_shipping: false,
    is_default_billing: false,
  });

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

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      full_name: "",
      street_address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      phone: "",
      is_default_shipping: addresses.length === 0,
      is_default_billing: addresses.length === 0,
    });
    setDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEdit = (addr: any) => {
    setEditingAddress(addr);
    setFormData({
      id: addr.id,
      full_name: addr.full_name || "",
      street_address: addr.street_address || "",
      city: addr.city || "",
      state: addr.state || "",
      postal_code: addr.postal_code || "",
      country: addr.country || "India",
      phone: addr.phone || "",
      is_default_shipping: !!addr.is_default_shipping,
      is_default_billing: !!addr.is_default_billing,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveAddress(formData);
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
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  value={formData.street_address}
                  onChange={(e) =>
                    setFormData({ ...formData, street_address: e.target.value })
                  }
                  placeholder="123 Main Street, Apt 4B"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="Maharashtra"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    placeholder="400001"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="India"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default_shipping"
                    checked={formData.is_default_shipping}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        is_default_shipping: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="is_default_shipping" className="text-sm font-normal">
                    Set as default shipping address
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default_billing"
                    checked={formData.is_default_billing}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        is_default_billing: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="is_default_billing" className="text-sm font-normal">
                    Set as default billing address
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
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
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
                    {addr.full_name}
                  </CardTitle>
                  <div className="flex gap-1.5 flex-wrap">
                    {addr.is_default_shipping && (
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        Default Shipping
                      </Badge>
                    )}
                    {addr.is_default_billing && (
                      <Badge variant="outline" className="text-[10px] border-emerald-600 text-emerald-600">
                        Default Billing
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>{addr.street_address}</p>
                <p>
                  {addr.city}, {addr.state} {addr.postal_code}
                </p>
                <p>{addr.country}</p>
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
