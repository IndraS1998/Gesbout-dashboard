import { NextResponse } from "next/server";
import { pool } from "@/scripts/conn";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const c = await pool.connect();

    const result= await c.query(
      `SELECT LOGIN, NOM, PRENOM FROM public."user" WHERE LOGIN = $1;`,
      [name]
    );

    const rows = result.rows;
    c.release();


    if (!process.env.JWT_SECRETKEY) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    if (rows.length > 0) {
      const t = jwt.sign({user : rows[0]},process.env.JWT_SECRETKEY,{expiresIn:'1h'})
      return NextResponse.json({ success: true, user: rows[0],token:t });
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
