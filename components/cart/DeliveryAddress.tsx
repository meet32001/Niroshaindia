"use client";

import { useState } from "react";
import { MapPin, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Address {
  id: string;
  name: string;
  type: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    name: "Meet Shah",
    type: "Home",
    addressLine1: "Flat 402, Nirosha Heights, MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Meet Shah (Office)",
    type: "Office",
    addressLine1: "Suite 12, Tech Park, BKC Complex",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    phone: "+91 98765 00000",
    isDefault: false,
  },
];

export function DeliveryAddress() {
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr-1");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-shop-orange" />
          <h3 className="text-base font-bold text-shop-dark dark:text-slate-100">
            Delivery Shipping Address
          </h3>
        </div>

        <button
          onClick={() => alert("Add Address modal coming up in checkout phase!")}
          className="text-xs font-semibold text-shop-orange hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New</span>
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_ADDRESSES.map((addr) => {
          const isSelected = selectedAddressId === addr.id;

          return (
            <div
              key={addr.id}
              onClick={() => setSelectedAddressId(addr.id)}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 cursor-pointer relative flex items-start gap-3",
                isSelected
                  ? "border-shop-orange bg-shop-orange/5 dark:bg-shop-orange/10 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300"
              )}
            >
              <input
                type="radio"
                name="deliveryAddress"
                checked={isSelected}
                onChange={() => setSelectedAddressId(addr.id)}
                className="mt-1 accent-shop-orange cursor-pointer"
              />

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {addr.name}
                  </span>
                  <span className="text-[10px] font-bold text-shop-orange bg-shop-orange/10 px-2 py-0.5 rounded-md uppercase">
                    {addr.type}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-300 leading-normal">
                  {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                </p>

                <p className="text-slate-500 font-medium pt-0.5">
                  Contact: {addr.phone}
                </p>
              </div>

              {isSelected && (
                <Check className="h-4 w-4 text-shop-orange shrink-0 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
