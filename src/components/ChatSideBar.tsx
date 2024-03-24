"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  // onChatDelete:(chatId:number)=>void;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  // const [loading, setLoading] = React.useState(false);
  // const handleChatDelete=(chatId:number,pdf_name:string)=>{
  //   console.log(`Deleting chat ${chatId} ${pdf_name}`);
    // axios.delete(`/api/chats/${chatId}`).then(()=>{
    //   onChatDelete(chatId);
    // });
  // };
  return (
    <div className="w-full h-screen overflow-scroll soff p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>
      <div className="flex max-h-screen overflow-scroll pb-20 flex-col gap-2 mt-4">
      {/* <div className="flex flex-col gap-2 mt-4"> */}
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-600 text-white": chat.id === chatId,
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap">
                {chat.pdfName}
              </p>
              <Button
                className={cn("px-2 ml-1 rounded-md",{
                  "bg-primary/90 hover:text-black hover:bg-white":chat.id===chatId,
                  "bg-white text-black hover:bg-primary/90 hover:text-white":chat.id!==chatId,
                })}
                // onClick={onChatDelete.bind(this,chatId)}
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