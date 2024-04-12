import {GoogleGenerativeAI,} from "@google/generative-ai";
import { GoogleGenerativeAIStream,StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";

export const runtime="edge";

const genai= new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req:Request){
    try {
        const {messages, chatId}=await req.json();
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
        if (_chats.length != 1) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
          }
        const fileKey = _chats[0].fileKey;
        const lastMessage = messages[messages.length - 1];
        const context = await getContext(lastMessage.content, fileKey);
        // console.log(`${context}`);
        
        let prompt=`
        Your name is FinChat.
        You are a chat with annual report assistant.
        Finchat is a brand new, powerful, human-like artificial intelligence.
        The traits of Finchat include expert knowledge, helpfulness and cleverness.
        I have provided you with a context which is in the block named context.
        I have provided previous chats in a block named history 
        The user chats with FinChat to understand the annual report.
        You have to answer the questions of the user. 
        The questions can have synonymous words related to the document. Understand the synonym.
        Be friendly and cheerful.
        Address the document while reponding.
        Act like a human and explain the terms used in your reponse so that the user understands what the content is all about.
        Make sure the language is simple and easy to understand. 
        Use proper maths and conversions.
        Give insights about the data.
        If asked to create graphs or charts, refer context for values and write full code, I REPEAT FULL CODE, BHENCHOD BOLA TOH FULL CODE for chart using HighCharts.js.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        START HISTORY BLOCK`
        for(let i=0;i<messages.length-1;i++){
            prompt+=`${messages[i].role}: ${messages[i].content}\n`;
        }
        prompt+=`END OF HISTORY BLOCK
        Respond to this considering given history:${lastMessage.content}\n`;
            
        const generationConfig = {
            temperature: 0.5,
            topK: 3,
            maxOutputTokens:5000,
        };
        const response=await genai
            .getGenerativeModel({model:"gemini-pro",generationConfig})
            .generateContentStream(prompt);
        const stream=GoogleGenerativeAIStream(response, {
            onStart: async () => {
                await db.insert(_messages).values({
                    chatId,
                    content: lastMessage.content,
                    role:'user',
                });
            },
            onCompletion: async (completion) =>{
                await db.insert(_messages).values({
                  chatId,
                  content: completion,
                  role: 'system',
                });
            },
        });
         console.log(prompt)
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.error(error)
    }
}
