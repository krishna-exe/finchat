import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { S3 } from "@aws-sdk/client-s3";
import { chats as ch,messages } from "@/lib/db/schema";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try{
        const { chatId, file_key }=await req.json();
        console.log(`Deleting ${chatId} ${file_key} ...`);
        const s3 = new S3({
            region: "ap-south-1",
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
            },
        });
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
        };
        const result = await s3.deleteObject(params);
        if (result)
            console.log(`${chatId} ${file_key} deleted from S3`);
        else 
            console.log(`Error deleting ${chatId} ${file_key} from S3`);

        // Deleting from Neon DB
        await db.delete(messages).where(eq(messages.chatId,chatId)).execute();
        await db.delete(ch).where(eq(ch.fileKey,file_key)).execute();
        console.log(`${chatId} ${file_key} deleted from Neon DB`);

        // Deleting from pinecone
        const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
        const index = pc.index("reports");
        await index.namespace(file_key).deleteAll();
        console.log(`${chatId} ${file_key} deleted from Pinecone`);

        //TODO: Deleting from local storage
        // fs.unlinkSync(`C:\\tmp\\1712050625988annual-report-fy-22-23-pg178.pdf`);
        
        console.log(`${chatId} ${file_key} deleted successfully`);
        return NextResponse.json({message: `${chatId} ${file_key} deleted successfully`},{status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({message: `Error deleting chat`},{status:500});
    }
}