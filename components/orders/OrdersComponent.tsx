"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Eye, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceFormatter } from "@/components/shared/PriceFormatter";
import { OrderDetailDialog } from "@/components/orders/OrderDetailDialog";

export interface OrdersComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[];
}

export function OrdersComponent({ orders }: OrdersComponentProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
            <TableRow>
              <TableHead className="font-bold">Order #</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Customer</TableHead>
              <TableHead className="font-bold hidden md:table-cell">Email</TableHead>
              <TableHead className="font-bold">Total</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.map((order) => {
              const formattedDate = order.orderDate
                ? format(new Date(order.orderDate), "dd MMM yyyy")
                : "N/A";

              const status = order.status || "paid";

              return (
                <TableRow
                  key={order._id || order.orderNumber}
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Order Number */}
                  <TableCell className="font-mono text-xs font-bold text-shop-orange">
                    #{order.orderNumber}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </TableCell>

                  {/* Customer Name */}
                  <TableCell className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {order.customerName || "Customer"}
                  </TableCell>

                  {/* Email (Hidden on Mobile) */}
                  <TableCell className="text-xs text-slate-500 hidden md:table-cell truncate max-w-[180px]">
                    {order.customerEmail || "N/A"}
                  </TableCell>

                  {/* Total Price */}
                  <TableCell>
                    <PriceFormatter amount={order.totalPrice} className="text-xs font-extrabold text-slate-900 dark:text-slate-100" />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 font-bold capitalize ${
                        status === "paid" || status === "delivered"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100"
                          : status === "shipped"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 hover:bg-blue-100"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100"
                      }`}
                    >
                      {status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="h-8 gap-1 text-xs font-bold text-shop-orange hover:text-amber-600 hover:bg-shop-orange/10 rounded-xl"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Interactive Detail Dialog Modal */}
      <OrderDetailDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
