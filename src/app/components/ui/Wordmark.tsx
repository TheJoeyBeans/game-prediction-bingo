const Wordmark = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center gap-2.5 font-display font-bold tracking-tight ${className}`}
  >
    <span className="h-2.5 w-2.5 rounded-full bg-live shadow-[0_0_12px_var(--color-live)] animate-live motion-reduce:animate-none" />
    Video Game Bingo
  </span>
);

export default Wordmark;
