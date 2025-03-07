import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { verifyToken } from "@/app/api/auth/middleware";
import { JwtPayload } from "jsonwebtoken";

export async function GET(req: NextRequest) {
    // ตรวจสอบ Token
    const decoded = await verifyToken(req);
    console.log("✅ Decoded Token:", decoded);

    
    if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (decoded as JwtPayload).id;
    console.log("🔹 User ID:", userId);

    // ดึงข้อมูล history ของ user
    const { data, error } = await supabase
        .from("receipt")
        .select("*")
        .eq("id_user", userId);  

    if (error) {
        console.error("Supabase Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
    try {
        //ตรวจสอบ Token
        const decoded = await verifyToken(req);
        if (!decoded || typeof decoded === "string" || !("id" in decoded)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (decoded as JwtPayload).id;
        console.log(" User ID:", userId);

        
        const { shop_name, detail, option, eco_option } = await req.json();

      
        if (!shop_name || !detail || !Array.isArray(detail)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        //บันทึก
        const { data, error } = await supabase
            .from("receipt")
            .insert([
                {
                    id_user: userId,
                    shop_name: shop_name,
                    detail: detail,  // JSON
                    option: option || 0,  
                    eco_option: eco_option ?? false, 
                }
            ])
            .select("*");

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Order created successfully", data }, { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }
}
