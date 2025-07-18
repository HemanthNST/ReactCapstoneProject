import { Notyf } from "notyf";

let notyf: Notyf | null = null;

// Initialize Notyf only on client-side
if (typeof window !== "undefined") {
  // Import CSS in a different way for client-side
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css";
  document.head.appendChild(link);

  notyf = new Notyf({
    duration: 4000,
    position: {
      x: "right",
      y: "top",
    },
    types: [
      {
        type: "success",
        background: "#4CAF50",
      },
      {
        type: "error",
        background: "#F44336",
      },
      {
        type: "warning",
        background: "#FF9800",
      },
      {
        type: "info",
        background: "#2196F3",
      },
    ],
  });
}

// Create a safe wrapper that checks for client-side
const safeNotyf = {
  success: (message: string) => {
    if (notyf && typeof window !== "undefined") {
      notyf.success(message);
    }
  },
  error: (message: string) => {
    if (notyf && typeof window !== "undefined") {
      notyf.error(message);
    }
  },
  open: (options: { type: string; message: string }) => {
    if (notyf && typeof window !== "undefined") {
      notyf.open(options);
    }
  },
};

export { safeNotyf as notyf };
