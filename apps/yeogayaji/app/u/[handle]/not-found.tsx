import Link from "next/link";

export default function PublicUserNotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                <p className="mb-2 text-sm text-white/50">404</p>
                <h1 className="text-2xl font-semibold">공개 리스트를 찾을 수 없어요</h1>
                <p className="mt-3 text-sm leading-6 text-white/70">
                    아이디가 없거나 아직 공개되지 않은 페이지입니다.
                </p>

                <Link
                    href="/"
                    className="mt-6 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-black"
                >
                    홈으로
                </Link>
            </div>
        </main>
    );
}