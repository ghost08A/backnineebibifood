import {NextRequest ,NextResponse} from "next/server"
import { supabase } from "@/lib/supabaseClient";

//The function extracts the category parameter from the request URL
export async function GET(req: NextRequest, {params}: {params:{category: string}}) {
    const {category} = params
    
//Queries the "shop" table in Supabase. 
    const {data,error} = await supabase.from("shop").select("*").eq("category",category)

//If there is a database error, return 500 Internal Server Error.
    if(error){
        return NextResponse.json({error: error.message},{status: 500})
    }
//If no shops are found in the category, return 404 Not Found.
    if(data.length === 0){
        return NextResponse.json({error: "Not found"},{status: 404})
    }
//If successful, returns the list of shops that match the category with a 200 OK response.
    return NextResponse.json(data,{status: 200})
}


