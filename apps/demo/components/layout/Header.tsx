import Link from "next/link";


export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/75 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8 lg:px-10">
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">Shin Daeho</p>
          <p className="text-xs text-zinc-400">Frontend / Fullstack Developer</p>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
          <a href="#projects" className="transition hover:text-white">
            Projects
          </a>
          <a href="#work" className="transition hover:text-white">
            How I Work
          </a>
          <a href="#career" className="transition hover:text-white">
            Career
          </a>
          <a href="#contact" className="transition hover:text-white">
            Contact
          </a>
          <Link
            href="/design-system"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm text-neutral-200 transition hover:bg-white/10"
          >
            Design System
          </Link>
        </nav>
      </div>
    </header>
  );
}