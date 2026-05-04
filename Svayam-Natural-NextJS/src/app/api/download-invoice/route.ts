import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.svayamnatural.com/api/v1";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let orderId: string | undefined;
    let token: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      orderId = body.orderId;
      token = body.token;
    } else {
      const formData = await request.formData();
      orderId = formData.get("orderId") as string | undefined;
      token = formData.get("token") as string | undefined;
    }
    if (!orderId || !token) {
      return NextResponse.json(
        { message: "Missing orderId or token" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/orders/admin/${orderId}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        return NextResponse.json(
          { message: data.message || "Failed to fetch invoice" },
          { status: res.status }
        );
      }
      const text = await res.text();
      return NextResponse.json(
        { message: text.slice(0, 500) || "Failed to fetch invoice" },
        { status: res.status }
      );
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const resContentType = res.headers.get("content-type") || "application/pdf";
    let contentDisposition =
      res.headers.get("content-disposition") ||
      `attachment; filename="invoice-${orderId}.pdf"`;

    if (/^\s*inline\s*;/i.test(contentDisposition)) {
      contentDisposition = contentDisposition.replace(/^\s*inline\s*;/i, "attachment;");
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": resContentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("Download invoice error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
