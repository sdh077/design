export type TossCatalogItem = {
  id: string;
  merchantId: number;
  title: string;
  code?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TossOrder = {
  id: string;
  merchantId: number;
  orderState: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  chargePrice?: {
    totalAmount?: number;
  };
  lineItems: Array<{
    quantity: number;
    item: {
      id?: string;
      title: string;
    };
    optionChoices?: Array<{
      title: string;
      code?: string;
      quantity?: number;
    }>;
  }>;
};

type TossSuccess<T> = {
  resultType: "SUCCESS";
  success: T;
};

type TossFail = {
  resultType: "FAIL";
  error: {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
};

type TossResponse<T> = TossSuccess<T> | TossFail;

export class TossClient {
  constructor(
    private readonly baseUrl: string,
    private readonly accessKey: string,
    private readonly secretKey: string,
    private readonly merchantId: string
  ) {}

  private async get<T>(path: string, query?: URLSearchParams): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      url.search = query.toString();
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-access-key": this.accessKey,
        "x-secret-key": this.secretKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = (await res.json()) as TossResponse<T>;

    if (!res.ok) {
      throw new Error(`Toss HTTP ${res.status}: ${JSON.stringify(json)}`);
    }

    if (json.resultType === "FAIL") {
      throw new Error(`${json.error.errorCode}: ${json.error.reason}`);
    }

    return json.success;
  }

  async getCatalogItems(page = 1, size = 100): Promise<TossCatalogItem[]> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortOrder: "DESC",
    });

    return this.get<TossCatalogItem[]>(
      `/api-public/openapi/v1/merchants/${this.merchantId}/catalog/items`,
      query
    );
  }

  async getOrders(params: {
    from: string;
    to: string;
    page?: number;
    size?: number;
  }): Promise<TossOrder[]> {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      page: String(params.page ?? 1),
      size: String(params.size ?? 100),
      sortOrder: "DESC",
    });

    return this.get<TossOrder[]>(
      `/api-public/openapi/v1/merchants/${this.merchantId}/order/orders`,
      query
    );
  }
}