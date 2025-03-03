import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ดึงข้อมูลทั้งหมดจาก Supabase (GET)
export async function GET() {
  const { data, error } = await supabase.from("user").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// เพิ่มข้อมูลใหม่ลง Supabase (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // อ่าน JSON จาก Request
    const { name, email, address, phone, password } = body;

    // ตรวจสอบค่าว่าง
    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing 'name' or 'email' in request body" },
        { status: 400 }
      );
    }
    if (!name || !email || !address || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, email, address, phone, password" },
        { status: 400 }
      );
    }

    // เพิ่มข้อมูลลง Supabase
    const { data, error } = await supabase.from("user").insert([
      {  name, email, address, phone, password }
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "User created successfully", data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
}
