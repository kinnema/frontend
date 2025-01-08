interface NavigationDotsProps {
  count: number
  active: number
}

export function NavigationDots({ count, active }: NavigationDotsProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-colors ${
            i === active ? "bg-emerald-400" : "bg-white/30"
          }`}
        />
      ))}
    </div>
  )
}

