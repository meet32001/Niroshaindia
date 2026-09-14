"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PriceFilterProps {
  minPrice: number | null; // in INR
  maxPrice: number | null; // in INR
  onPriceChange: (min: number | null, max: number | null) => void;
}

const MIN_LIMIT = 0;
const MAX_LIMIT = 150000;
const STEP = 500;

const BUDGET_PILLS = [
  { label: "Under ₹10k", min: 0, max: 10000 },
  { label: "₹10k–₹25k", min: 10000, max: 25000 },
  { label: "₹25k–₹50k", min: 25000, max: 50000 },
  { label: "Above ₹50k", min: 50000, max: 150000 },
];

export function PriceFilter({
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceFilterProps) {
  const [localMin, setLocalMin] = useState<number>(minPrice ?? MIN_LIMIT);
  const [localMax, setLocalMax] = useState<number>(maxPrice ?? MAX_LIMIT);

  // Synchronize local state with props whenever props change externally
  useEffect(() => {
    setLocalMin(minPrice ?? MIN_LIMIT);
    setLocalMax(maxPrice ?? MAX_LIMIT);
  }, [minPrice, maxPrice]);

  // Debounced notification to parent / URL
  const debouncedDispatch = useCallback(
    (min: number, max: number) => {
      const isDefault = min === MIN_LIMIT && max === MAX_LIMIT;
      if (isDefault) {
        onPriceChange(null, null);
      } else {
        onPriceChange(min > MIN_LIMIT ? min : null, max < MAX_LIMIT ? max : null);
      }
    },
    [onPriceChange]
  );

  const handleMinSlider = (val: number) => {
    const clamped = Math.min(val, localMax - STEP);
    setLocalMin(clamped);
    debouncedDispatch(clamped, localMax);
  };

  const handleMaxSlider = (val: number) => {
    const clamped = Math.max(val, localMin + STEP);
    setLocalMax(clamped);
    debouncedDispatch(localMin, clamped);
  };

  const handleMinInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let parsed = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsed) || parsed < MIN_LIMIT) parsed = MIN_LIMIT;
    if (parsed > localMax - STEP) parsed = localMax - STEP;
    setLocalMin(parsed);
    debouncedDispatch(parsed, localMax);
  };

  const handleMaxInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let parsed = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(parsed)) parsed = MAX_LIMIT;
    if (parsed > MAX_LIMIT) parsed = MAX_LIMIT;
    if (parsed < localMin + STEP) parsed = localMin + STEP;
    setLocalMax(parsed);
    debouncedDispatch(localMin, parsed);
  };

  const handlePillClick = (pillMin: number, pillMax: number) => {
    const isAlreadySelected =
      localMin === pillMin &&
      (pillMax === MAX_LIMIT ? localMax >= MAX_LIMIT : localMax === pillMax);

    if (isAlreadySelected) {
      // Reset
      setLocalMin(MIN_LIMIT);
      setLocalMax(MAX_LIMIT);
      onPriceChange(null, null);
    } else {
      setLocalMin(pillMin);
      setLocalMax(pillMax);
      onPriceChange(pillMin > MIN_LIMIT ? pillMin : null, pillMax < MAX_LIMIT ? pillMax : null);
    }
  };

  const handleReset = () => {
    setLocalMin(MIN_LIMIT);
    setLocalMax(MAX_LIMIT);
    onPriceChange(null, null);
  };

  const hasActivePrice =
    (minPrice !== null && minPrice > MIN_LIMIT) ||
    (maxPrice !== null && maxPrice < MAX_LIMIT);

  // Percentages for dual slider track
  const minPercent = Math.min(100, Math.max(0, (localMin / MAX_LIMIT) * 100));
  const maxPercent = Math.min(100, Math.max(0, (localMax / MAX_LIMIT) * 100));

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Price Range
        </h3>
        {hasActivePrice && (
          <button
            onClick={handleReset}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Dual Slider Range Track */}
      <div className="relative pt-2 pb-1">
        {/* Background Track */}
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative">
          {/* Active Highlighted Range Bar */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-75"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />
        </div>

        {/* Range Input 1 (Min Handle) */}
        <input
          type="range"
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step={STEP}
          value={localMin}
          onChange={(e) => handleMinSlider(Number(e.target.value))}
          className="absolute top-1 left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none z-10
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-emerald-600 [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
        />

        {/* Range Input 2 (Max Handle) */}
        <input
          type="range"
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step={STEP}
          value={localMax}
          onChange={(e) => handleMaxSlider(Number(e.target.value))}
          className="absolute top-1 left-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-600
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-emerald-600 [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
        />
      </div>

      {/* Min & Max Numeric Inputs */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase">
            Min Price
          </label>
          <div className="relative mt-0.5">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              ₹
            </span>
            <input
              type="text"
              value={localMin.toLocaleString("en-IN")}
              onChange={(e) => {
                const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                setLocalMin(isNaN(num) ? 0 : num);
              }}
              onBlur={handleMinInputBlur}
              className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase">
            Max Price
          </label>
          <div className="relative mt-0.5">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              ₹
            </span>
            <input
              type="text"
              value={localMax.toLocaleString("en-IN")}
              onChange={(e) => {
                const num = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                setLocalMax(isNaN(num) ? MAX_LIMIT : num);
              }}
              onBlur={handleMaxInputBlur}
              className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Quick-Select Budget Pills */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Quick Select
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {BUDGET_PILLS.map((pill) => {
            const isPillActive =
              localMin === pill.min &&
              (pill.max === MAX_LIMIT ? localMax >= MAX_LIMIT : localMax === pill.max);

            return (
              <button
                key={pill.label}
                type="button"
                onClick={() => handlePillClick(pill.min, pill.max)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center border cursor-pointer",
                  isPillActive
                    ? "bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
