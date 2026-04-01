type ParsedNaverShareInput = {
  normalizedLink: string | null;
  placeName: string | null;
};

function extractUrlCandidate(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const matches = [
    ...trimmed.matchAll(/https?:\/\/[^\s]+|(?:^|\s)(naver\.me\/[A-Za-z0-9]+)(?=\s|$)/gi),
  ];

  if (!matches.length) {
    return trimmed;
  }

  const last = matches[matches.length - 1];
  return (last[1] ?? last[0]).trim();
}

function extractPlaceNameCandidate(input: string): string | null {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/^https?:\/\//i.test(line) || /^naver\.me\//i.test(line)) continue;
    if (/^\[[^\]]+\]$/.test(line)) continue;
    if (/^(네이버지도|naver map)$/i.test(line)) continue;
    return line;
  }

  return null;
}

export function parseNaverShareInput(input: string): ParsedNaverShareInput {
  const urlCandidate = extractUrlCandidate(input);

  return {
    normalizedLink: urlCandidate ? normalizeNaverMeLink(urlCandidate) : null,
    placeName: extractPlaceNameCandidate(input),
  };
}

export function normalizeNaverMeLink(input: string): string | null {
  const extracted = extractUrlCandidate(input);
  const trimmed = extracted?.trim() ?? "";
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    // We only support short links like https://naver.me/5Kb3kUc8
    if (url.hostname !== "naver.me" && !url.hostname.endsWith(".naver.me")) {
      return withProtocol;
    }
    return url.toString();
  } catch {
    return withProtocol;
  }
}

export function extractNaverMapCode(input: string): string | null {
  const extracted = extractUrlCandidate(input);
  const trimmed = extracted?.trim() ?? "";
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  // Prefer URL parsing.
  try {
    const url = new URL(withProtocol);
    if (url.hostname === "naver.me" || url.hostname.endsWith(".naver.me")) {
      const segment = url.pathname.split("/").filter(Boolean)[0];
      return segment || null;
    }
  } catch {
    // ignore and fallback to regex
  }

  const m = trimmed.match(/naver\.me\/([A-Za-z0-9]+)/);
  return m?.[1] ?? null;
}

function cleanNaverTitle(title: string) {
  // 네이버 페이지 제목은 보통 "XXX - 네이버지도" 같은 형태입니다.
  return title
    .replace(/\s*-\s*네이버지도.*$/i, "")
    .replace(/\s*-\s*네이버.*$/i, "")
    .replace(/\s*\|\s*네이버지도.*$/i, "")
    .replace(/\s*\|\s*네이버.*$/i, "")
    .trim();
}

function decodeHtmlEntities(input: string) {
  // 정교한 디코딩보다는 "이름" 보여주기 용도의 최소 처리만 합니다.
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function extractNaverPlaceName(
  naverMapUrl: string
): Promise<string | null> {
  const normalizedUrl = normalizeNaverMeLink(naverMapUrl);
  if (!normalizedUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(normalizedUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const html = await res.text();

    const ogTitle =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
      )?.[1] ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i
      )?.[1] ??
      html.match(
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
      )?.[1];

    if (ogTitle) return cleanNaverTitle(decodeHtmlEntities(ogTitle));

    const title =
      html.match(/<title>([^<]+)<\/title>/i)?.[1] ??
      html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1];

    if (title) return cleanNaverTitle(decodeHtmlEntities(title));

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
