"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle, Trash2, } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  handleDelete:(chatId:number,file_key:string)=>void;
};

const ChatSideBar = ({ chats, chatId, handleDelete}: Props) => {
  const [deletingChatId, setDeletingChatId] = React.useState<number | null>(null);
  // const [loading, setLoading] = React.useState(false);
  // const deleteChat=async (chatId:number,file_key:string)=>{
  //   try{
  //     console.log(`Deleting ${chatId} ${file_key} ...`)
      
  //     //Deleting from S3
  //     const s3 = new S3({
  //       region: "ap-south-1",
  //       credentials: {
  //         accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
  //         secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  //       },
  //     });
  //     const params = {
  //       Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
  //       Key: file_key,
  //     };
  //     const result =await s3.deleteObject(params);
  //     if (result.DeleteMarker)
  //       console.log(`${file_key} deleted from S3!!`);
  //     else
  //       console.log(`Error deleting ${file_key} from S3`);

  //     // Deleting from Neon DB
  //     // const deletedChats=await db.delete(ch).where(eq(ch.fileKey,file_key)).execute();
  //     // const deletedMessages=await db.delete(messages).where(eq(messages.chatId,chatId)).execute();
  //     // console.log(`${file_key} deleted from Neon DB!!`);
  
  //     //Deleting from pinecone
  //     const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
  //     const index = pc.index("reports")
  //     await index.namespace(file_key).deleteAll();
  //     console.log(`${file_key} deleted from Pinecone!!`)
  
  //     console.log(`${file_key} deleted successfully!!`)
  //   }
  //   catch(error){
  //     console.error(error);
  //   }
  // };
  return (
    <div className="w-full h-screen overflow-scroll soff p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>
      <div className="flex max-h-screen pb-20 flex-col gap-2 mt-4">
      {/* <div className="flex flex-col gap-2 mt-4"> */}
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-400 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId && chat.id!== deletingChatId,
                "pointer-events-none bg-red-600": chat.id === deletingChatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap">
                {chat.pdfName}
              </p>
              <Button
                className={cn("px-2 ml-1 rounded-md",{
                  "bg-blue-600 hover:text-black hover:bg-white":chat.id===chatId,
                  "bg-primary/90 text-white hover:bg-white hover:text-black":chat.id!==chatId,
                })}
                onClick={(event)=>{
                  event.preventDefault()
                  handleDelete(chat.id,chat.fileKey);
                  setDeletingChatId(chat.id);
                  window.location.reload();
                }}
              >
                  <Trash2 className="ml-auto"></Trash2>
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;