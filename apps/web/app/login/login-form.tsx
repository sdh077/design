"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      window.location.href = next || "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        placeholder="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Button
        onClick={onLogin}
        disabled={loading || !email || !password}
        className="w-full"
      >
        {loading ? "로그인 중..." : "로그인"}
      </Button>
    </div>
  );
}