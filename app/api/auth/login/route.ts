import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "@/app/api/auth/middleware";
import { JwtPayload } from "jsonwebtoken";




export async function GET(req: NextRequest) {
  const decoded = await verifyToken(req);
  console.log("✅ Decoded Token:", decoded);

  //ตรวจสอบว่ามี Token 
  if (!decoded || typeof decoded === "string" || !(decoded as JwtPayload).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (decoded as JwtPayload).id;

  // ✅ ดึงข้อมูล
  const { data, error } = await supabase
    .from("user")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // อ่าน JSON จาก Request
    const { email, password } = body;

   
    // ตรวจสอบค่าว่าง
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing 'email' or 'password'" },
        { status: 400 }
      );
    }

    // ดึงข้อมูล User 
    const { data: users, error } = await supabase
      .from("user")
      .select("id, name, email, password")
      .eq("email", email)
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0]; 

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // สร้าง JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.BCRYPT_SALT!,
      { expiresIn: "7d" } // Token 7 day
    );

    return NextResponse.json({ message: "Login successful", token, user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }
}
