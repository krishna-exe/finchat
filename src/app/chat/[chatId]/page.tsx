import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { S3 } from "@aws-sdk/client-s3";
import { chats as ch,messages } from "@/lib/db/schema";
import { Pinecone } from "@pinecone-database/pinecone";
import fs from "fs";

type Props = {
	params: {
		chatId: string;
	};
};

const ChatPage = async ({ params: { chatId } }: Props) => {
	const { userId } = await auth();
	if (!userId) {
		return redirect("/sign-in");
	}
	const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
	if (!_chats) {
		return redirect("/");
	}
	if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
		return redirect("/");
	}

	const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
	const deleteChat = async (chatId: number, file_key: string) => {
		"use server";
		try {
			console.log(`Deleting ${chatId} ${file_key} ...`);

			// Deleting from S3
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
				console.log(`${chatId} ${file_key} deleted from S3!!`);
			else 
				console.log(`Error deleting ${chatId} ${file_key} from S3`);

			// Deleting from Neon DB
			await db.delete(messages).where(eq(messages.chatId,chatId)).execute();
			await db.delete(ch).where(eq(ch.fileKey,file_key)).execute();
			console.log(`${chatId} ${file_key} deleted from Neon DB!!`);

			// Deleting from pinecone
			const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
			const index = pc.index("reports");
			await index.namespace(file_key).deleteAll();
			console.log(`${chatId} ${file_key} deleted from Pinecone!!`);

			//TODO: Deleting from local storage
			// fs.unlinkSync(`C:\\tmp\\1712050625988annual-report-fy-22-23-pg178.pdf`);

			console.log(`${chatId} ${file_key} deleted successfully!!`);
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<div className="flex max-h-screen overflow-scroll">
			<div className="flex w-full max-h-screen overflow-scroll">
				{/* chat sidebar */}
				<div className="flex-[1] max-w-xs">
					<ChatSideBar chats={_chats} chatId={parseInt(chatId)} handleDelete={deleteChat} />
				</div>
				{/* pdf viewer */}
				<div className="max-h-screen p-4 oveflow-scroll flex-[5]">
					<PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
				</div>
				{/* chat component */}
				<div className="flex-[3] border-l-4 border-l-slate-200">
					<ChatComponent chatId={parseInt(chatId)} />
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
