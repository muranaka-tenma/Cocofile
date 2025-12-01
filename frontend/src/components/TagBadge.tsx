// CocoFile - Tag Badge Component
// Displays a tag badge with its associated color

import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useTagManagementStore } from "@/store/tagManagementStore";
import { X } from "lucide-react";

interface TagBadgeProps {
  tagName: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tagName,
  variant = "default",
  className = "",
  onRemove,
  size = "md",
}) => {
  const { tags } = useTagManagementStore();

  // Find the tag to get its color
  const tagColor = useMemo(() => {
    const tag = tags.find((t) => t.name === tagName || t.id === tagName);
    return tag?.color || "#6B7280"; // Default gray color
  }, [tags, tagName]);

  // Convert hex color to RGB for background with opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 107, g: 114, b: 128 }; // Default gray
  };

  const rgb = hexToRgb(tagColor);
  const backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
  const borderColor = tagColor;
  const textColor = tagColor;

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "px-3 py-1.5 text-sm";

  return (
    <Badge
      variant={variant}
      className={`${sizeClasses} ${className}`}
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      {tagName}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 hover:opacity-70"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
};

export default TagBadge;
