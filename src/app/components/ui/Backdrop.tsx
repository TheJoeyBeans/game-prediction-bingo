// Ambient glow in the current event's color (--event), plus a faint dot grid.
// Gradients rather than blur filters keep it cheap on phones.
const Backdrop = ({ glow = true }: { glow?: boolean }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    {glow && (
      <div
        className="absolute left-1/2 top-[-35vmax] h-[80vmax] w-[80vmax] -translate-x-1/2 opacity-15"
        style={{
          background: "radial-gradient(closest-side, var(--event), transparent)",
        }}
      />
    )}
    <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] bg-size-[24px_24px] mask-[linear-gradient(to_bottom,black,transparent_70%)]" />
  </div>
);

export default Backdrop;
