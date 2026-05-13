import { Info, AlertCircle, ShieldCheck } from "lucide-react";

type InfoBoxProps = {
  variant?: "info" | "error" | "success";
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
};

const InfoBox = ({
  variant = "info",
  children,
  className,
  icon,
  onClose,
}: InfoBoxProps) => {
  const variants = {
    success: {
      bg: "bg-neutral-600",
      icon: <ShieldCheck className="h-7 w-7 text-neutral-200  border-green-700" />,
    },
    info: {
      bg: "bg-neutral-600",
      icon: <Info className="h-7 w-7 text-neutral-200" />,
    },
    error: {
      bg: "bg-red-800",
      icon: <AlertCircle className="h-6 w-6 text-neutral-200" />,
    },
  };

  return (
    <div
      className={`
        border border-zinc-600 rounded-md p-2 text-sm mb-4 flex items-start gap-3
        ${variants[variant].bg} ${className || ""}
      `}
    >
      {icon || variants[variant].icon}
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          className="text-neutral-300 hover:text-white transition-colors"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default InfoBox;