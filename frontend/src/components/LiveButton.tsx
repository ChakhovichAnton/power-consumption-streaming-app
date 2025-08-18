interface LiveButtonProps {
  isLive: boolean;
  onClick: () => void;
  disabled: boolean;
}

const LiveButton: React.FC<LiveButtonProps> = ({
  isLive,
  onClick,
  disabled,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-white font-medium transition 
        ${
          isLive
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gray-600 hover:bg-gray-700"
        }`}
    >
      <span
        className={`w-2 h-2 rounded-full animate-pulse 
          ${isLive ? "bg-green-400" : "bg-gray-300"}`}
      ></span>
      {isLive ? "Live" : "View live data"}
    </button>
  );
};

export default LiveButton;
