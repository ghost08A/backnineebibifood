import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyToken } from "@/app/api/auth/middleware";
import { JwtPayload } from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  try {
    // ตรวจสอบ Token
    const decoded = await verifyToken(req);
    if (!decoded || typeof decoded === "string" || !(decoded as JwtPayload).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (decoded as JwtPayload).id;

    // อ่านข้อมูลอัปเดตจาก body
    const body = await req.json();
    const { name, address, phone } = body;

    if (!name && !address && !phone) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

    //อัปเดตข้อมูล
    const { data, error } = await supabase
      .from("user")
      .update({ name, address, phone })
      .eq("id", userId)
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Update successful", data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
