import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: data.message || "Failed to fetch invoice" },
        { status: res.status }
      );
    }

    const blob = await res.blob();
    const resContentType = res.headers.get("content-type") || "application/pdf";
    const contentDisposition =
      res.headers.get("content-disposition") ||
      `attachment; filename="invoice-${orderId}.pdf"`;

    return new NextResponse(blob, {
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
