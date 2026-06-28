"use client";

import React from "react";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  onValueCommit?: (value: [number, number]) => void;
}

export function Slider({
  min,
  max,
  step,
  value,
  onValueChange,
  onValueCommit,
}: SliderProps) {
  const [minValue, maxValue] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(parseFloat(e.target.value), maxValue - step);
    onValueChange([val, maxValue]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(parseFloat(e.target.value), minValue + step);
    onValueChange([minValue, val]);
  };

  const triggerCommit = () => {
    if (onValueCommit) {
      onValueCommit(value);
    }
  };

  // Percent calculation for the track highlight
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-8 flex flex-col justify-center select-none font-body">
      {/* Slider track background */}
      <div className="absolute left-0 right-0 h-1 bg-border rounded-full" />

      {/* Slider active track segment */}
      <div
        className="absolute h-1 bg-primary rounded-full"
        style={{
          left: `${minPercent}%`,
          right: `${100 - maxPercent}%`,
        }}
      />

      {/* Invisible inputs layered on top */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={handleMinChange}
        onMouseUp={triggerCommit}
        onTouchEnd={triggerCommit}
        className="absolute w-full h-1 pointer-events-auto appearance-none bg-transparent outline-none cursor-pointer opacity-0 z-20"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        onMouseUp={triggerCommit}
        onTouchEnd={triggerCommit}
        className="absolute w-full h-1 pointer-events-auto appearance-none bg-transparent outline-none cursor-pointer opacity-0 z-20"
      />

      {/* Styled custom thumbs */}
      <div
        className="absolute w-4.5 h-4.5 rounded-full border border-primary bg-surface shadow-md pointer-events-none z-10 flex items-center justify-center transform -translate-x-1/2"
        style={{ left: `${minPercent}%` }}
      >
        <div className="w-1.5 h-1.5 bg-primary-dark rounded-full" />
      </div>

      <div
        className="absolute w-4.5 h-4.5 rounded-full border border-primary bg-surface shadow-md pointer-events-none z-10 flex items-center justify-center transform -translate-x-1/2"
        style={{ left: `${maxPercent}%` }}
      >
        <div className="w-1.5 h-1.5 bg-primary-dark rounded-full" />
      </div>
    </div>
  );
}
