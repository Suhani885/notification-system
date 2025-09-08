export const Loader = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-slate-700">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
            backgroundSize: "60px 60px",
            animation: "gridMove 20s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)
              `,
            animation: "gradientShift 15s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="w-screen h-screen flex items-center justify-center">
          <h1 className="text-4xl text-center">Loading....</h1>
        </div>
      </div>
    </div>
  );
};
