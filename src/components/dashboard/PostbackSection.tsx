import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export const POSTBACK_URL =
  "https://track.twinbid.com/postback?cid={click_id}&payout={payout}&status={status}";

export function PostbackSection() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(POSTBACK_URL);
      setCopied(true);
      toast.success(t("postback.copied"));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("postback.copyFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("postback.urlLabel")}</Label>
        <div className="flex gap-2">
          <Input value={POSTBACK_URL} readOnly className="bg-background border-border font-mono text-sm" />
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="border-border shrink-0 gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t("postback.copied") : t("postback.copy")}
          </Button>
        </div>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>{t("postback.help1")}</p>
        <p>{t("postback.help2")}</p>
        <p className="text-foreground/80">{t("postback.help3")}</p>
      </div>
    </div>
  );
}
