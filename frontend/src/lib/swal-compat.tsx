
import { createRoot } from "react-dom/client";
import { OceanConfirmDialog } from "@/components/ui/ocean-confirm-dialog";
import { triggerGlobalToast } from "@/components/ui/ocean-toast";

// Helper to map simple titles to professional Indonesian terms
const getProfessionalTitle = (title: string, type: string): string => {
  const cleanTitle = (title || "").trim();
  if (!cleanTitle) {
    if (type === "success") return "Tindakan Berhasil";
    if (type === "error") return "Terjadi Kesalahan";
    if (type === "warning") return "Pemberitahuan Kontrol";
    return "Informasi Layanan";
  }

  const lower = cleanTitle.toLowerCase();
  if (lower === "error" || lower === "gagal" || lower === "gagal!") {
    return "Gagal Memproses Tindakan";
  }
  if (lower === "success" || lower === "berhasil" || lower === "berhasil!") {
    return "Tindakan Berhasil Diselesaikan";
  }
  if (lower === "info") {
    return "Informasi Sistem";
  }
  if (lower === "warning" || lower === "validasi" || lower === "format tidak sesuai" || lower === "file terlalu besar") {
    return "Validasi Formulir";
  }
  if (lower.includes("yakin hapus") || lower.includes("hapus data")) {
    return "Konfirmasi Penghapusan Data";
  }
  if (lower.includes("yakin")) {
    return "Konfirmasi Tindakan";
  }

  return cleanTitle;
};

// Helper to clean up descriptions and make them more professional
const getProfessionalDescription = (text: string): string => {
  const cleanText = (text || "").trim();
  if (!cleanText) return "";

  // Convert raw short sentences to professional ones if applicable
  const lowerText = cleanText.toLowerCase();
  if (lowerText === "mohon lengkapi semua field yang wajib diisi" || lowerText === "mohon lengkapi semua field yang wajib!") {
    return "Silakan lengkapi seluruh informasi yang wajib diisi pada formulir sebelum melanjutkan proses.";
  }

  return cleanText;
};

const SwalMock = {
  fire: async (firstArg: any, secondArg?: any, thirdArg?: any) => {
    let options: any = {};

    // Handle different sweetalert2 call signatures:
    // 1. Swal.fire('Title', 'Message', 'success')
    // 2. Swal.fire({ title: 'Title', ... })
    if (typeof firstArg === "string") {
      options.title = firstArg;
      options.text = secondArg || "";
      options.icon = thirdArg || "info";
    } else if (firstArg && typeof firstArg === "object") {
      options = { ...firstArg };
    }

    const type = options.icon === "warning" ? "warning" : options.icon === "error" ? "error" : options.icon === "success" ? "success" : "info";

    // Format display title & description professionally
    const displayTitle = getProfessionalTitle(options.title, type);
    const displayDesc = getProfessionalDescription(options.text || options.html || "");

    // Heuristic: determine if this should render as a Toast notification
    // or as a Modal Alert/Confirm Dialog.
    const isToast =
      options.toast === true ||
      options.timer !== undefined ||
      options.showConfirmButton === false ||
      (options.confirmButtonText === undefined && options.showCancelButton !== true);

    const isConfirm = !isToast;

    if (isConfirm) {
      return new Promise((resolve) => {
        const container = document.createElement("div");
        document.body.appendChild(container);
        const root = createRoot(container);

        const cleanup = () => {
          root.unmount();
          container.remove();
        };

        const handleConfirm = () => {
          resolve({ isConfirmed: true, isDismissed: false, value: true });
          cleanup();
        };

        const handleOpenChange = (open: boolean) => {
          if (!open) {
            resolve({ isConfirmed: false, isDismissed: true, value: false });
            cleanup();
          }
        };

        // Custom professional confirm labels
        let confirmBtnText = options.confirmButtonText || "Konfirmasi";
        if (confirmBtnText.toLowerCase() === "ya, hapus!" || confirmBtnText.toLowerCase() === "ya, hapus") {
          confirmBtnText = "Ya, Hapus Permanen";
        } else if (confirmBtnText.toLowerCase() === "ya, generate!") {
          confirmBtnText = "Ya, Perbarui Link";
        }

        root.render(
          <OceanConfirmDialog
            open={true}
            onOpenChange={handleOpenChange}
            title={displayTitle}
            description={displayDesc || "Apakah Anda yakin ingin melanjutkan tindakan ini?"}
            confirmLabel={confirmBtnText}
            cancelLabel={options.cancelButtonText || "Batal"}
            showCancelButton={options.showCancelButton === true}
            variant={type === "warning" ? "warning" : type === "error" ? "danger" : "info"}
            onConfirm={handleConfirm}
          />
        );
      });
    } else {
      // Direct toast display
      triggerGlobalToast(type, displayTitle, displayDesc);

      // Return sweetalert2 expected response promise resolver immediately
      return Promise.resolve({ isConfirmed: true, isDismissed: false, value: true });
    }
  },
};

export default SwalMock;
export const Swal = SwalMock;
export const swal = SwalMock;
export type SwalType = typeof SwalMock;
