import { LoadS3IntoPinecone } from "@/lib/pinecone";
import {NextResponse} from "next/server";

export async function POST(req: Request, res: Response) {
    try{
        const body = await req.json();
        const {file_key, file_name} = body;
        console.log(file_key, file_name);
        const pages = await LoadS3IntoPinecone(file_key);
        console.log(pages)
        return NextResponse.json({pages,message:`${file_name} uploaded successfully!`});
    }
    catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}