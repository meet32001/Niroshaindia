import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/header/Logo";
import { HeaderMenu } from "@/components/header/HeaderMenu";
import { SearchBar } from "@/components/header/SearchBar";
import { FavoriteButton } from "@/components/header/FavoriteButton";
import { CartIcon } from "@/components/header/CartIcon";
import { SignInButton } from "@/components/header/SignInButton";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Banner Announcement */}
      <div className="bg-shop-orange text-white text-xs font-medium py-1.5 text-center tracking-wide shadow-sm">
        Welcome to Nirosha India — India&apos;s Premier Destination for Premium Electronics & Gadgets
      </div>

      <Container>
        <div className="flex h-16 items-center justify-between gap-4 sm:gap-6">
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <MobileMenu />
            <Logo />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <HeaderMenu />

          {/* Search Bar & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <SearchBar />
            <FavoriteButton itemCount={0} />
            <CartIcon itemCount={0} />
            <SignInButton />
          </div>
        </div>
      </Container>
    </header>
  );
}
