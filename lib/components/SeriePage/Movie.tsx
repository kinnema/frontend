export function Movie() {
  return (
    <div className="select-none group">
      <div className="relative rounded-lg overflow-hidden">
        <span className="absolute top-2.5 left-2.5 rounded z-20 px-2.5 py-0.5 text-xs text-black bg-primary font-bold">
          Tập 14
        </span>
        <div className="bg-stone-900 overflow-hidden animate-pulse aspect-[2/3]">
          <img
            src="https://img.ophim1.com/uploads/movies/co-ay-hoan-hao-thumb.jpg"
            alt="Perfect Her"
            className="duration-300 object-cover h-full w-full opacity-0 blur-lg "
            width="300"
            height="450"
            loading="lazy"
            draggable="false"
          />
        </div>
        <a
          className="absolute inset-0 z-10 md:hidden"
          href="/movies/co-ay-hoan-hao"
        ></a>
        <div className="absolute inset-0 bg-black/60 none flex-col items-center justify-center gap-4 text-sm font-bold opacity-0 group-hover:opacity-100 duration-300 text-center hidden md:flex">
          <button className="rounded-full w-36 px-6 py-2.5 -translate-y-3 group-hover:translate-y-0 duration-300 bg-primary text-black">
            Yêu Thích
          </button>
          <a
            className="rounded-full border-2 bg- border-primary w-36 px-6 py-2.5 bg-black/70 translate-y-3 group-hover:translate-y-0 duration-300 hover:bg-primary hover:text-black"
            href="/movies/co-ay-hoan-hao"
          >
            Chi Tiết
          </a>
        </div>
      </div>
      <h3 className="flex items-center justify-between my-1.5 gap-5 md:my-3">
        <a
          className="hover:text-primary duration-150 text-lg font-bold truncate"
          href="/movies/co-ay-hoan-hao"
        >
          <abbr title="Cô Ấy Hoàn Hảo" className="no-underline">
            Cô Ấy Hoàn Hảo
          </abbr>
        </a>
        <span className="text-primary text-sm font-medium hidden md:block">
          2024
        </span>
      </h3>
      <div className="flex flex-col gap-1.5 justify-between text-xs md:items-center md:flex-row">
        <div className="flex items-center gap-2">
          <span className="border-2 border-white px-2 py-0.5">
            <strong className="text-primary">HD</strong>
          </span>
          <span className="bg-white px-2 py-1">
            <strong className="text-black">Vietsub</strong>
          </span>
        </div>
        <span className="flex items-center gap-2 truncate">
          <svg
            aria-hidden="true"
            role="img"
            className="text-primary iconify iconify--akar-icons"
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m15 16l-2.414-2.414A2 2 0 0 1 12 12.172V6"></path>
            </g>
          </svg>
          45 phút/tập
        </span>
      </div>
    </div>
  );
}
