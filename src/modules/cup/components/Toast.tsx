type Props = {
  message: string | null;
};

function Toast({ message }: Props) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white shadow-glow backdrop-blur-xl">
        {message}
      </div>
    </div>
  );
}

export default Toast;
