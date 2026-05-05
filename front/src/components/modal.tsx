import type { ReactNode, MouseEvent } from "react";
import { useEffect } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  hideScrollbar?: boolean;
  align?: "start" | "center";
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  "sm": "md:max-w-sm",
  "md": "md:max-w-md",
  "lg": "md:max-w-lg",
  "xl": "md:max-w-xl",
  "2xl": "md:max-w-2xl",
  "3xl": "md:max-w-3xl",
  "4xl": "md:max-w-4xl",
  "5xl": "md:max-w-5xl",
  "6xl": "md:max-w-6xl",
  "7xl": "md:max-w-7xl",
  "full": "md:max-w-full",
};

export const Modal = ({
  isOpen,
  onClose,
  children,
  hideScrollbar = true,
  align = "start",
  size = "md",
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackgroundClick = () => {
    onClose();
  };

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-gray-600/50 ${align === "center" ? "items-center" : "items-start py-6 sm:py-8"
        }`}
      onClick={handleBackgroundClick}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-full relative mx-3 sm:mx-4 ${sizeClasses[size]}`}
        onClick={handleContentClick}
      >
        <div className={`w-full max-h-[calc(100vh-3rem)] overflow-y-auto ${hideScrollbar ? "hide-scrollbar" : ""}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};