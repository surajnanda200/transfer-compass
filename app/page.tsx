export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Transfer Compass
      </h1>
      <p className="text-lg text-gray-300 max-w-xl text-center mb-8">
        Plan, track, and execute your college transfer applications in one
        clean, organized dashboard.
      </p>
      <a
        href="/dashboard"
        className="px-6 py-3 rounded-full border border-white text-sm font-semibold hover:bg-white hover:text-black transition"
      >
        Go to dashboard
      </a>
    </main>
  );
}
