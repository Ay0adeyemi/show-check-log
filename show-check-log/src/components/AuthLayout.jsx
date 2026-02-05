export default function AuthLayout({ heading = "Show Check Log", children }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1220] flex items-center justify-center px-4 py-10">
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/30 blur-3xl rounded-full" />
      <div className="absolute -bottom-28 -right-20 w-96 h-96 bg-cyan-400/20 blur-3xl rounded-full" />

      <svg
        className="absolute inset-0 opacity-30"
        viewBox="0 0 1200 600"
        fill="none"
      >
        <path
          d="M0 320 C 150 220, 300 420, 450 320 S 750 220, 900 320 S 1050 420, 1200 320"
          stroke="#22d3ee"
          strokeWidth="2"
        />
        <path
          d="M0 300 C 150 400, 300 200, 450 300 S 750 400, 900 300 S 1050 200, 1200 300"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="8 8"
        />
      </svg>

      <div className="absolute top-10 text-center w-full">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide text-blue-400">
          {heading}
        </h1>
       
      </div>


      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-xl p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
