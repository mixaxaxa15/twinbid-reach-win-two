import { Mail, Send } from "lucide-react";
import twinbidLogo from "@/assets/twinbid-logo.svg";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <a href="#" className="flex items-center gap-2">
              <img src={twinbidLogo} alt="TwinBid" className="h-8" />
            </a>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TwinBid. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="mailto:twinbid@twinbidex.com"
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors"
              title="twinbid@twinbidex.com"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href="https://t.me/GregTwinbid"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors"
              title="Telegram: @GregTwinbid"
            >
              <Send className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
