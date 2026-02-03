export default function PageIllustration() {
  return (
    <>
      {/* Top gradient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 opacity-60"
        aria-hidden="true"
      >
        <div
          className="h-[600px] w-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)',
            opacity: 0.15,
          }}
        />
      </div>
      {/* Side accent */}
      <div
        className="pointer-events-none absolute right-0 top-1/4 -z-10 opacity-40"
        aria-hidden="true"
      >
        <div
          className="h-[400px] w-[400px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, white 0%, transparent 70%)',
            opacity: 0.2,
          }}
        />
      </div>
    </>
  );
}
