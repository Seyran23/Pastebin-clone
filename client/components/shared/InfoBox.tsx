import { AlertCircle, Info, ShieldCheck, X } from 'lucide-react';

type InfoBoxProps = {
  variant?: 'info' | 'error' | 'success';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
};

const InfoBox = ({ variant = 'info', children, className, icon, onClose }: InfoBoxProps) => {
  const variants = {
    success: {
      bg: 'bg-neutral-700',
      icon: <ShieldCheck className="h-5 w-5 text-green-400 shrink-0" />,
    },
    info: {
      bg: 'bg-neutral-700',
      icon: <Info className="h-5 w-5 text-neutral-200 shrink-0" />,
    },
    error: {
      bg: 'bg-red-900/60',
      icon: <AlertCircle className="h-5 w-5 text-red-300 shrink-0" />,
    },
  };

  return (
    <div
      className={`border border-zinc-600 rounded-md p-3 text-sm mb-4 flex items-start gap-3 ${variants[variant].bg} ${className ?? ''}`}
    >
      {icon ?? variants[variant].icon}
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          className="text-neutral-400 hover:text-white transition-colors shrink-0"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default InfoBox;
