import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, Plus, Trash2, Loader2, Pencil, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Creative } from "@/contexts/CampaignContext";
import { ImageCropperDialog, type CropperTarget } from "@/components/dashboard/ImageCropperDialog";
import { CreativePreviewDialog } from "@/components/dashboard/CreativePreviewDialog";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImageDims(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

const URL_MACROS = [
  "click_id", "site_id", "country_code", "creative_id",
  "campaign_id", "browser", "device", "device_os", "ip_address",
] as const;

interface CreativesEditorProps {
  formatKey: string;
  bannerSize?: string;
  creatives: Creative[];
  onChange: (creatives: Creative[]) => void;
  errors?: Record<string, string>;
  onClearError?: (...keys: string[]) => void;
}

const generateId = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);

const MAX_CREATIVES = 10;
const MAX_IMAGE_BYTES = 1 * 1024 * 1024;

function getTargetDims(formatKey: string, bannerSize?: string): CropperTarget | null {
  if (formatKey === "banner") {
    if (!bannerSize || !/^\d+x\d+$/.test(bannerSize)) return null;
    const [w, h] = bannerSize.split("x").map(Number);
    return { w, h, mode: "fixed" };
  }
  if (formatKey === "push") return { w: 192, h: 192, mode: "fixed" };
  if (formatKey === "native") return { w: 200, h: 200, mode: "square-resizable", minSide: 200 };
  return null;
}

export function CreativesEditor({ formatKey, bannerSize, creatives, onChange, errors = {}, onClearError }: CreativesEditorProps) {
  const { t } = useLanguage();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Original source per creative (for re-opening cropper)
  const [origSources, setOrigSources] = useState<Record<string, { dataUrl: string; naturalWidth: number; naturalHeight: number; fileName: string; isGif: boolean }>>({});
  const [cropperCreativeId, setCropperCreativeId] = useState<string | null>(null);
  const [previewCreativeId, setPreviewCreativeId] = useState<string | null>(null);

  const target = getTargetDims(formatKey, bannerSize);

  const showTitle = formatKey === "native" || formatKey === "push";
  const showDescription = formatKey === "native" || formatKey === "push";
  const showImage = formatKey !== "popunder";

  const updateCreative = (id: string, updates: Partial<Creative>) => {
    onChange(creatives.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCreative = () => {
    if (creatives.length >= MAX_CREATIVES) {
      toast.error(t("create.creativeLimit").replace("{max}", String(MAX_CREATIVES)));
      return;
    }
    onChange([...creatives, { id: generateId(), url: "" }]);
  };

  const removeCreative = (id: string) => {
    if (creatives.length <= 1) return;
    onChange(creatives.filter(c => c.id !== id));
    setOrigSources(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif"];

  const checkMismatch = (natW: number, natH: number): boolean => {
    if (!target) return false;
    if (target.mode === "fixed") return natW !== target.w || natH !== target.h;
    // square-resizable: require square, min side
    return natW !== natH || natW < (target.minSide ?? 200);
  };

  const handleImageUpload = async (creativeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t("create.imageFormatError"));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t("create.imageSizeError"));
      e.target.value = "";
      return;
    }
    setUploadingId(creativeId);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const { w, h } = await loadImageDims(dataUrl);
      const isGif = file.type === "image/gif" || ext === ".gif";
      const mismatch = checkMismatch(w, h);
      setOrigSources(prev => ({
        ...prev,
        [creativeId]: { dataUrl, naturalWidth: w, naturalHeight: h, fileName: file.name, isGif },
      }));
      updateCreative(creativeId, {
        imageUrl: dataUrl,
        pendingFile: file,
        imageFileName: file.name,
        sizeMismatch: mismatch,
      });
      onClearError?.(`creative_${creativeId}_image`);
      toast.success(t("create.imageUploaded"));
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(t("create.imageFormatError"));
    } finally {
      setUploadingId(null);
      e.target.value = "";
    }
  };

  const appendMacro = (url: string, macro: string) => {
    if (url.includes(`{${macro}}`)) return url;
    const token = `${macro}={${macro}}`;
    const separator = url.includes("?") ? "&" : "?";
    return url + separator + token;
  };

  const toggleMacro = (creativeId: string, macro: string, currentUrl: string) => {
    if (macro === "click_id") {
      updateCreative(creativeId, { url: appendMacro(currentUrl, macro) });
      return;
    }
    if (currentUrl.includes(`{${macro}}`)) {
      let newUrl = currentUrl;
      const regexAmp = new RegExp(`[&?]${macro}=\\{${macro}\\}`, "g");
      newUrl = newUrl.replace(regexAmp, "");
      if (newUrl.includes("&") && !newUrl.includes("?")) {
        newUrl = newUrl.replace("&", "?");
      }
      updateCreative(creativeId, { url: newUrl });
    } else {
      updateCreative(creativeId, { url: appendMacro(currentUrl, macro) });
    }
  };

  const ensureClickId = (creativeId: string, url: string) => {
    if (!url.trim()) return;
    if (!url.includes("{click_id}")) {
      updateCreative(creativeId, { url: appendMacro(url, "click_id") });
    }
  };

  const openCropper = (creativeId: string) => {
    if (!origSources[creativeId]) return;
    setCropperCreativeId(creativeId);
  };

  const activeSource = cropperCreativeId ? origSources[cropperCreativeId] : null;

  return (
    <>
    <div className="space-y-4">
      {creatives.map((creative, idx) => {
        const activeMacros = new Set(URL_MACROS.filter(m => creative.url.includes(`{${m}}`)));
        const src = origSources[creative.id];
        const canCrop = !!src && !src.isGif && !!target;

        return (
          <div key={creative.id} className="p-4 rounded-lg border border-border bg-background/30 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t("create.creative")} #{idx + 1}
              </p>
              {creatives.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeCreative(creative.id)}
                  className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("create.creativeName")} *</Label>
              <Input value={creative.name || ""} onChange={e => { updateCreative(creative.id, { name: e.target.value }); if (e.target.value.trim()) onClearError?.(`creative_${creative.id}_name`); }}
                placeholder={t("create.creativeNamePlaceholder")}
                className={`bg-background border-border ${errors[`creative_${creative.id}_name`] ? "border-destructive" : ""}`} />
              <p className="text-xs text-muted-foreground">{t("create.creativeNameHint")}</p>
              {errors[`creative_${creative.id}_name`] && <p className="text-xs text-destructive">{errors[`creative_${creative.id}_name`]}</p>}
            </div>

            {showTitle && (
              <div className="space-y-2">
                <Label>{t("create.creativeTitle")} *</Label>
                <Input value={creative.title || ""} onChange={e => { updateCreative(creative.id, { title: e.target.value }); if (e.target.value.trim()) onClearError?.(`creative_${creative.id}_title`); }}
                  placeholder={t("create.titlePlaceholder")}
                  className={`bg-background border-border ${errors[`creative_${creative.id}_title`] ? "border-destructive" : ""}`} />
                {errors[`creative_${creative.id}_title`] && <p className="text-xs text-destructive">{errors[`creative_${creative.id}_title`]}</p>}
              </div>
            )}

            {showDescription && (
              <div className="space-y-2">
                <Label>{t("create.creativeDescription")} *</Label>
                <Textarea value={creative.description || ""} onChange={e => { updateCreative(creative.id, { description: e.target.value }); if (e.target.value.trim()) onClearError?.(`creative_${creative.id}_description`); }}
                  placeholder={t("create.descriptionPlaceholder")}
                  className={`bg-background border-border resize-none ${errors[`creative_${creative.id}_description`] ? "border-destructive" : ""}`} rows={2} />
                {errors[`creative_${creative.id}_description`] && <p className="text-xs text-destructive">{errors[`creative_${creative.id}_description`]}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("create.creativeUrl")} *</Label>
              <Input value={creative.url} onChange={e => { updateCreative(creative.id, { url: e.target.value }); if (e.target.value.trim()) onClearError?.(`creative_${creative.id}_url`); }}
                onBlur={e => ensureClickId(creative.id, e.target.value)}
                placeholder="https://example.com/landing"
                className={`bg-background border-border ${errors[`creative_${creative.id}_url`] ? "border-destructive" : ""}`} />
              {errors[`creative_${creative.id}_url`] && <p className="text-xs text-destructive">{errors[`creative_${creative.id}_url`]}</p>}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t("create.urlMacrosHint")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {URL_MACROS.map(macro => {
                    const isActive = activeMacros.has(macro);
                    const isRequired = macro === "click_id";
                    return (
                      <Badge
                        key={macro}
                        variant="outline"
                        className={`cursor-pointer text-xs font-mono transition-colors ${
                          isRequired
                            ? "bg-primary/20 border-primary/60 text-primary"
                            : isActive
                              ? "bg-primary/15 border-primary/40 text-primary hover:bg-primary/25"
                              : "hover:bg-primary/10 hover:border-primary/30"
                        }`}
                        onClick={() => toggleMacro(creative.id, macro, creative.url)}
                        title={isRequired ? "Required" : undefined}
                      >
                        {`{${macro}}`}{isRequired ? " *" : ""}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            {showImage && (
              <div className="space-y-2">
                <Label>{t("create.uploadImage")} *</Label>
                <input
                  ref={el => { fileInputRefs.current[creative.id] = el; }}
                  type="file" accept=".png,.jpg,.jpeg,.gif" className="hidden"
                  onChange={e => handleImageUpload(creative.id, e)} />
                <p className="text-xs text-muted-foreground">
                  {t("create.imageFormatHint")}
                  {target && (target.mode === "fixed"
                    ? ` · ${target.w}×${target.h}px`
                    : ` · ≥ ${target.minSide ?? 200}×${target.minSide ?? 200}px (1:1)`)}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Button type="button" variant="outline" disabled={uploadingId === creative.id}
                    onClick={() => fileInputRefs.current[creative.id]?.click()} className="border-border gap-2">
                    {uploadingId === creative.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Upload className="h-4 w-4" />}
                    {t("create.uploadImage")}
                  </Button>
                  {canCrop && (
                    <Button type="button" variant="outline" onClick={() => openCropper(creative.id)} className="border-border gap-2">
                      <Pencil className="h-4 w-4" />
                      {t("create.editImage")}
                    </Button>
                  )}
                  {creative.imageUrl && formatKey !== "popunder" && (
                    <Button type="button" variant="outline" onClick={() => setPreviewCreativeId(creative.id)} className="border-border gap-2">
                      <Eye className="h-4 w-4" />
                      {t("create.previewCreative")}
                    </Button>
                  )}
                  {creative.imageFileName && <span className="text-sm text-muted-foreground">{creative.imageFileName}</span>}
                </div>
                {creative.sizeMismatch && target && (
                  <div className="flex items-start gap-2 p-2 rounded border border-yellow-500/30 bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-500">
                      {src?.isGif
                        ? t("create.gifExactSize").replace("{w}", String(target.w)).replace("{h}", String(target.h))
                        : t("create.imageWrongSize").replace("{w}", String(target.w)).replace("{h}", String(target.h))}
                    </p>
                  </div>
                )}
                {creative.imageUrl && (
                  <button type="button" onClick={() => setPreviewUrl(creative.imageUrl!)} className="block">
                    <img src={creative.imageUrl} alt="Preview" className="mt-2 max-h-32 rounded border border-border cursor-zoom-in hover:opacity-90 transition-opacity" />
                  </button>
                )}
                {errors[`creative_${creative.id}_image`] && <p className="text-xs text-destructive">{errors[`creative_${creative.id}_image`]}</p>}
              </div>
            )}
          </div>
        );
      })}

      {formatKey !== "popunder" && (
        <Button type="button" variant="outline" onClick={addCreative}
          disabled={creatives.length >= MAX_CREATIVES}
          className="border-border gap-2 w-full">
          <Plus className="h-4 w-4" /> {t("create.addCreative")} ({creatives.length}/{MAX_CREATIVES})
        </Button>
      )}
    </div>
    <Dialog open={!!previewUrl} onOpenChange={(o) => { if (!o) setPreviewUrl(null); }}>
      <DialogContent className="max-w-4xl p-2 bg-card border-border">
        {previewUrl && (
          <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[85vh] object-contain rounded" />
        )}
      </DialogContent>
    </Dialog>
    <ImageCropperDialog
      open={!!cropperCreativeId}
      source={activeSource ? { dataUrl: activeSource.dataUrl, naturalWidth: activeSource.naturalWidth, naturalHeight: activeSource.naturalHeight } : null}
      target={target}
      fileNameHint={activeSource?.fileName}
      onClose={() => setCropperCreativeId(null)}
      onSave={(file, dataUrl) => {
        if (!cropperCreativeId) return;
        updateCreative(cropperCreativeId, {
          imageUrl: dataUrl,
          pendingFile: file,
          imageFileName: file.name,
          sizeMismatch: false,
        });
        setCropperCreativeId(null);
      }}
    />
    <CreativePreviewDialog
      open={!!previewCreativeId}
      onClose={() => setPreviewCreativeId(null)}
      formatKey={formatKey}
      bannerSize={bannerSize}
      creative={creatives.find(c => c.id === previewCreativeId) || null}
    />
    </>
  );
}
