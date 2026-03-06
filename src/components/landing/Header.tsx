import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";
import twinbidLogo from "@/assets/twinbid-logo.svg";

const navLinks = [
  { label: "Преимущества", href: "#benefits" },
  { label: "Форматы", href: "#formats" },
  { label: "Как начать", href: "#steps" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="#" className="flex items-center gap-2">
            <img src={twinbidLogo} alt="TwinBid" className="h-10" />
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <AuthDialog trigger={<Button variant="ghost" className="text-muted-foreground hover:text-foreground">Войти</Button>} defaultTab="login" />
            <AuthDialog trigger={<Button className="gradient-primary text-primary-foreground hover:opacity-90 glow-primary">Регистрация</Button>} defaultTab="register" />
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <AuthDialog trigger={<Button variant="ghost" className="justify-start text-muted-foreground">Войти</Button>} defaultTab="login" />
                <AuthDialog trigger={<Button className="gradient-primary text-primary-foreground">Регистрация</Button>} defaultTab="register" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
