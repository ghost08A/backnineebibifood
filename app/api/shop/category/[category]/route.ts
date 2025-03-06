import {NextRequest ,NextResponse} from "next/server"
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest, {params}: {params:{category: string}}) {
    const {category} = params

    
    const {data,error} = await supabase.from("shop").select("*").eq("category",category)

    if(error){
        return NextResponse.json({error: error.message},{status: 500})
    }

    if(data.length === 0){
        return NextResponse.json({error: "Not found"},{status: 404})
    }

    return NextResponse.json(data,{status: 200})

}
