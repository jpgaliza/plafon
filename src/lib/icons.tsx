import type { CSSProperties } from "react";
import {
  UtensilsCrossed,
  Car,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Wrench,
  Banknote,
  Laptop,
  TrendingUp,
  MoreHorizontal,
  Tv,
  Music,
  Dumbbell,
  Cloud,
  CreditCard,
  Wallet,
  Coffee,
} from "lucide-react";

interface CategoryIconProps {
  name?: string | null;
  className?: string;
  style?: CSSProperties;
}

export function CategoryIcon({ name, className, style }: CategoryIconProps) {
  switch (name) {
    case "UtensilsCrossed":
      return <UtensilsCrossed className={className} style={style} />;
    case "Car":
      return <Car className={className} style={style} />;
    case "Home":
      return <Home className={className} style={style} />;
    case "Heart":
      return <Heart className={className} style={style} />;
    case "GraduationCap":
      return <GraduationCap className={className} style={style} />;
    case "Gamepad2":
      return <Gamepad2 className={className} style={style} />;
    case "ShoppingBag":
      return <ShoppingBag className={className} style={style} />;
    case "Wrench":
      return <Wrench className={className} style={style} />;
    case "Banknote":
      return <Banknote className={className} style={style} />;
    case "Laptop":
      return <Laptop className={className} style={style} />;
    case "TrendingUp":
      return <TrendingUp className={className} style={style} />;
    case "Tv":
      return <Tv className={className} style={style} />;
    case "Music":
      return <Music className={className} style={style} />;
    case "Dumbbell":
      return <Dumbbell className={className} style={style} />;
    case "Cloud":
      return <Cloud className={className} style={style} />;
    case "CreditCard":
      return <CreditCard className={className} style={style} />;
    case "Wallet":
      return <Wallet className={className} style={style} />;
    case "Coffee":
      return <Coffee className={className} style={style} />;
    case "MoreHorizontal":
    default:
      return <MoreHorizontal className={className} style={style} />;
  }
}
