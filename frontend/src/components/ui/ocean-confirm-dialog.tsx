import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface OceanConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  showCancelButton?: boolean;
  children?: React.ReactNode;
}

const variantStyles = {
  danger: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    ring: "ring-rose-200",
    confirmClass:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    ring: "ring-amber-200",
    confirmClass:
      "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25",
  },
  info: {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    ring: "ring-sky-200",
    confirmClass:
      "gradient-ocean text-primary-foreground shadow-lg",
  },
};

export function OceanConfirmDialog({
  open,
  onOpenChange,
  title = "Konfirmasi Penghapusan Data",
  description = "Tindakan ini akan menghapus data secara permanen dari sistem dan tidak dapat dibatalkan. Harap pastikan kembali sebelum melanjutkan.",
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  variant = "danger",
  loading = false,
  onConfirm,
  showCancelButton = true,
  children,
}: OceanConfirmDialogProps) {
  const styles = variantStyles[variant];

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children && (
        <AlertDialogPrimitive.Trigger asChild>{children}</AlertDialogPrimitive.Trigger>
      )}
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
        />
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
            "rounded-2xl border border-border bg-card p-0 shadow-2xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200"
          )}
        >
          {/* Decorative top gradient line */}
          <div
            className={cn(
              "h-1.5 w-full rounded-t-2xl",
              variant === "danger" && "bg-rose-500",
              variant === "warning" && "bg-amber-500",
              variant === "info" && "gradient-ocean"
            )}
          />

          <div className="p-6 sm:p-8">
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="absolute right-4 top-5 rounded-full p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
                  styles.iconBg,
                  styles.iconColor,
                  styles.ring
                )}
              >
                <AlertTriangle className="h-7 w-7" strokeWidth={1.8} />
              </div>
            </div>

            {/* Text */}
            <AlertDialogPrimitive.Title className="text-xl font-semibold tracking-tight text-foreground">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </AlertDialogPrimitive.Description>

            {/* Actions */}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {showCancelButton && (
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="w-full rounded-xl border-border bg-card px-6 text-foreground hover:bg-muted hover:text-foreground sm:w-auto"
                >
                  {cancelLabel}
                </Button>
              )}
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  "w-full rounded-xl px-6 transition-all duration-200 sm:w-auto",
                  styles.confirmClass
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Memproses…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {confirmLabel}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export function useOceanConfirmDialog() {
  const [open, setOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<OceanConfirmDialogProps>>({});

  const show = React.useCallback((newConfig: Omit<OceanConfirmDialogProps, "open" | "onOpenChange">) => {
    setConfig(newConfig);
    setOpen(true);
  }, []);

  const hide = React.useCallback(() => setOpen(false), []);

  const dialog = (
    <OceanConfirmDialog
      title={config.title}
      description={config.description}
      confirmLabel={config.confirmLabel}
      cancelLabel={config.cancelLabel}
      variant={config.variant}
      loading={config.loading}
      onConfirm={config.onConfirm || (() => {})}
      showCancelButton={config.showCancelButton}
      open={open}
      onOpenChange={setOpen}
    />
  );

  return { show, hide, dialog, open, setOpen };
}
