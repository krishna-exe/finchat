"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send, Loader2, CircleStop  } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import Markdown from 'react-markdown'

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages, isLoading, stop } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });
  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  return (
    /* when max-h-screen, the form goes to the bottom, but goes out of the screen 
        OG CODE
        <div className="relative max-h-screen overflow-scroll" id="message-container">
    */
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>
      <div className="flex-grow overflow-auto" id="message-container">
        <MessageList messages={messages} isLoading={isLoading} />   
      </div>
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white mt-2"
      >
        <div className="flex">
          <Input
            type="text"
            value={input}
            disabled={isLoading}
            onChange={handleInputChange}
            placeholder={isLoading ?"Generating . . ." :"Ask any question..."}
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2 rounded-full">
			{isLoading ? 
				(<Loader2 onClick={stop} className="h-4 w-4 animate-spin"/>) 
				: 
				(<Send className="h-4 w-4" />)}
            
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;