import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/header/Logo";
import { HeaderMenu } from "@/components/header/HeaderMenu";
import { SearchBar } from "@/components/header/SearchBar";
import { FavoriteButton } from "@/components/header/FavoriteButton";
import { CartIcon } from "@/components/header/CartIcon";
import { OrdersButton } from "@/components/header/OrdersButton";
import { SignInButton } from "@/components/header/SignInButton";
import { MobileMenu } from "@/components/layout/MobileMenu";

export async function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
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
            <OrdersButton />
            <FavoriteButton itemCount={0} />
            <CartIcon itemCount={0} />
            <SignInButton />
          </div>
        </div>
      </Container>
    </header>
  );
}
