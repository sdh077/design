"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient("public");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
  };

  const inputClass =
    "w-full border border-black/10 bg-[#f5f5f0] px-4 py-3 text-sm text-[#0a0a0a] outline-none focus:border-black/40 transition-colors";

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-4">✓</div>
        <p className="font-bold text-[#0a0a0a] mb-2">이메일을 확인해주세요</p>
        <p className="text-sm text-black/60">인증 링크를 보내드렸습니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-widest uppercase text-black/60">이름</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-widest uppercase text-black/60">이메일</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs tracking-widest uppercase text-black/60">비밀번호</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 bg-black text-white py-3.5 text-sm tracking-widest uppercase hover:bg-black/80 transition-all disabled:opacity-50"
      >
        {loading ? "처리 중..." : "회원가입"}
      </button>
    </form>
  );
}
