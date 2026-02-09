export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/20 blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-[30%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-chart-1/10 blur-[80px] animate-pulse delay-2000" />
    </div>
  );
}
