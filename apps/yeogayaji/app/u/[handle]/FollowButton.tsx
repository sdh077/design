"use client";

import { useState } from "react";

export function FollowButton({
  followingId,
  initialFollowing,
}: {
  followingId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follows", {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: followingId }),
      });
      if (res.ok) {
        setFollowing((v) => !v);
      } else {
        const payload = await res.json().catch(() => null) as { message?: string } | null;
        alert(`실패: ${payload?.message ?? res.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-50 ${
        following
          ? "bg-[#E5E8EB] text-[#4E5968] hover:bg-[#D1D6DB]"
          : "bg-[#191F28] text-white hover:bg-[#2D3540]"
      }`}
    >
      {loading ? "…" : following ? "팔로잉" : "팔로우"}
    </button>
  );
}
