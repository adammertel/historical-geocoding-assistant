import * as React from "react";
import { cn } from "@/lib/utils";

interface MenuProps {
  children: React.ReactNode;
  className?: string;
}

export const Menu = ({ children, className, ...props }: MenuProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-2 bg-background rounded-md border shadow-sm",
        className
      )}
      {...props}>
      {children}
    </div>
  );
};

interface MenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const MenuLabel = ({
  children,
  className,
  ...props
}: MenuLabelProps) => {
  return (
    <p
      className={cn(
        "text-xs font-medium text-muted-foreground uppercase tracking-wider",
        className
      )}
      {...props}>
      {children}
    </p>
  );
};

interface MenuListProps {
  children: React.ReactNode;
  className?: string;
}

export const MenuList = ({ children, className, ...props }: MenuListProps) => {
  return (
    <ul className={cn("space-y-1 text-sm", className)} {...props}>
      {children}
    </ul>
  );
};

interface MenuItemProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLLIElement>) => void;
}

export const MenuItem = ({
  children,
  className,
  active = false,
  onClick,
  ...props
}: MenuItemProps) => {
  return (
    <li
      className={cn(
        "px-2 py-1 rounded-md cursor-pointer transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onClick}
      {...props}>
      {children}
    </li>
  );
};
