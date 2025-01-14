export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-black/95">
      <div className="container px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2024 tabii. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white">Gizlilik</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">Kullanım Şartları</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">Yardım Merkezi</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

