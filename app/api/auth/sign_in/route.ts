import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";


// เพิ่มข้อมูล
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // อ่าน JSON จาก Request
    const { name, email, address, phone, password } = body;

    
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

    //hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS!));
     
    // เพิ่มข้อมูล
    const { data, error } = await supabase.from("user").insert([
      {  name, email, address, phone, password: hashedPassword },
    ]).select("*"); 

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "User created successfully", data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
}
