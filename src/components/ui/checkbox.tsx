import * as React from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, children, className = "" }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <div
        className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
          checked 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => onCheckedChange(!checked)}
      >
        {checked && <Check className="h-3 w-3" />}
      </div>
      {children && <span className="text-sm">{children}</span>}
    </label>
  );
} 