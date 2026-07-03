import {
  Music,
  PartyPopper,
  Drama,
  Image as ImageIcon,
  Film,
  Trophy,
  Store,
  ShoppingBasket,
  Baby,
  Landmark,
  Church,
  Tag,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  Music,
  PartyPopper,
  Drama,
  Image: ImageIcon,
  Film,
  Trophy,
  Store,
  ShoppingBasket,
  Baby,
  Landmark,
  Church,
  Tag,
};

export function getCategoryIcon(name: string): LucideIcon {
  return categoryIcons[name] ?? Tag;
}
