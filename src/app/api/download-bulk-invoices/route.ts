import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let date: string | undefined;
    let token: string | undefined;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      date = body.date;
      token = body.token;
    } else {
      const formData = await request.formData();
      date = formData.get("date") as string | undefined;
      token = formData.get("token") as string | undefined;
    }

    if (!token) {
      return NextResponse.json(
        { message: "Missing token" },
        { status: 400 }
      );
    }

    const dateParam = date || new Date().toISOString().slice(0, 10);
    const res = await fetch(
      `${API_BASE}/orders/admin/bulk-ship-invoices?date=${dateParam}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: data.message || "Failed to fetch invoices" },
        { status: res.status }
      );
    }

    const blob = await res.blob();
    const resContentType = res.headers.get("content-type") || "application/zip";
    const contentDisposition =
      res.headers.get("content-disposition") ||
      `attachment; filename="invoices-${dateParam}.zip"`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": resContentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("Download bulk invoices error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
