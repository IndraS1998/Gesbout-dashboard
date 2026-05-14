import { NextResponse } from "next/server";
import {psql} from "@/scripts/conn";
import dotenv from "dotenv";

dotenv.config();

export async function GET() {
    try{
        const result = await psql`SELECT ID_CLIENT,NOM FROM public."client";`;
        return NextResponse.json({ success:true,status: 200,rows: result });
    }catch (err){
        console.log(err)
        if(err instanceof Error){
            return NextResponse.json({ success: false, error: err.message }, { status: 500 });
        }else{
            return NextResponse.json({ success: false, error: "Unknown error" }, { status: 500 });
        }
    }
}
