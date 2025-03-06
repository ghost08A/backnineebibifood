import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest, context: { params: { id?: string } }) {
  // ✅ ใช้ `context.params` และรอให้ค่าพร้อม
  const params = await context.params;

  // ✅ เช็คก่อนว่า `id` มีค่าหรือไม่
  if (!params || !params.id) {
    return NextResponse.json({ error: "Missing shop ID" }, { status: 400 });
  }

  const shopId = parseInt(params.id, 10);

  console.log("🔹 ID ร้านค้า:", shopId);

  // ✅ ตรวจสอบว่า `id` เป็นตัวเลขที่ถูกต้อง
  if (isNaN(shopId)) {
    return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
  }

  // ✅ ดึงข้อมูลเมนูจากร้านค้า
  const { data, error } = await supabase
    .from("product")
    .select("*")
    .eq("id_shop", shopId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: "No products found in this shop" }, { status: 404 });
  }

  return NextResponse.json(data, { status: 200 });
}
