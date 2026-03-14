export default function PlansEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="text-6xl mb-4">📅</div>
      <h2 className="text-xl font-bold mb-2" style={{ color: '#222222' }}>
        No plans yet
      </h2>
      <p className="text-sm mb-6" style={{ color: '#555555' }}>
        Generate your first plan to get started
      </p>
      <a href="/plans/generate"
        className="text-white px-6 py-3 rounded-full font-semibold text-sm"
        style={{ backgroundColor: '#FF5A5F' }}>
        Build a Plan
      </a>
    </div>
  )
}