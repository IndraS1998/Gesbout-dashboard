import { NextResponse } from "next/server";
import { psql } from "@/scripts/conn";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const [result]= await psql`SELECT LOGIN, NOM, PRENOM FROM public."user" WHERE LOGIN = ${name};`;
    console.log(result);

    if (!process.env.JWT_SECRETKEY) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    if (result) {
      const t = jwt.sign({user : result},process.env.JWT_SECRETKEY,{expiresIn:'1h'})
      return NextResponse.json({ success: true, user: result,token:t });
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    console.log(error)
    if(error instanceof Error){
      return NextResponse.json({ success: false, error: error }, { status: 500 });
    }else{
      return NextResponse.json({ success: false, error: "Unknown error" }, { status: 500 });
    }
  }
}
