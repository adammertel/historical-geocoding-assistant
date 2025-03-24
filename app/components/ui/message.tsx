import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface MessageProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "danger" | "success" | "warning" | "info";
  onClose?: () => void;
}

export const Message = ({
  title,
  children,
  className,
  variant = "default",
  onClose,
  ...props
}: MessageProps) => {
  const variantStyles = {
    default: "bg-background border",
    primary: "bg-primary/10 border-primary/20 text-primary-foreground",
    danger: "bg-danger/10 border-danger/20 text-danger",
    success: "bg-green-500/10 border-green-500/20 text-green-700",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-700",
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 shadow-sm",
        variantStyles[variant],
        className
      )}
      {...props}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      {title && <div className="mb-2 font-medium">{title}</div>}
      <div className="text-sm">{children}</div>
    </div>
  );
};
