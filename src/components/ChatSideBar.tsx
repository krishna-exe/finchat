"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle, Trash2, } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type Props = {
  chats: DrizzleChat[];
  chatId: number;
  handleDelete:(chatId:number,file_key:string)=>void;
};

const ChatSideBar = ({ chats, chatId, handleDelete}: Props) => {
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
                "hover:text-white": chat.id !== chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap">
                {chat.pdfName}
              </p>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button
                    className={cn("px-2 ml-1 rounded-md",{
                      "bg-blue-600 hover:text-black hover:bg-white":chat.id===chatId,
                      "bg-primary/90 text-white hover:bg-white hover:text-black":chat.id!==chatId,
                    })}
                  >
                      <Trash2 className="ml-auto"></Trash2>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deleting {chat.pdfName}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this chat?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={async (event)=>{
                        event.preventDefault()
                        await handleDelete(chat.id,chat.fileKey);
                        window.location.reload(); 
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;