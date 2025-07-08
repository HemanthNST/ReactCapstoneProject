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
        icon: {
          className: "material-icons",
          tagName: "i",
          text: "✓",
        },
      },
      {
        type: "error",
        background: "#F44336",
        icon: {
          className: "material-icons",
          tagName: "i",
          text: "✗",
        },
      },
      {
        type: "warning",
        background: "#FF9800",
        icon: {
          className: "material-icons",
          tagName: "i",
          text: "⚠",
        },
      },
      {
        type: "info",
        background: "#2196F3",
        icon: {
          className: "material-icons",
          tagName: "i",
          text: "ℹ",
        },
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
