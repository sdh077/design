export async function sendGoogleChatWebhook(params: {
  webhookUrl: string;
  storeName: string;
  items: Array<{
    name: string;
    currentStock: number;
    safetyStock: number;
    unit: string;
  }>;
}) {
  const { webhookUrl, storeName, items } = params;

  if (!webhookUrl || items.length === 0) return;

  const lines = items.map(
    (item) =>
      `- ${item.name}: 현재고 ${item.currentStock}${item.unit} / 안전재고 ${item.safetyStock}${item.unit}`
  );

  const text = [
    `⚠️ 재고 부족 알림`,
    `지점: ${storeName}`,
    "",
    ...lines,
    "",
    "확인 후 발주 또는 재고 조정을 진행해주세요.",
  ].join("\n");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    console.error("Google Chat 전송 실패", await res.text());
  }
}