import {GoogleGenerativeAI,} from "@google/generative-ai";
import { GoogleGenerativeAIStream,StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";


async function createFile(content:string) {

    fs.writeFile("test.txt", content, err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`File created created successfully!`);
    });
  }
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
        console.log(`${context}`)
        
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
        If asked to create graphs or charts, refer context for values and write code using python.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        START HISTORY BLOCK`
        for(let i=0;i<messages.length-1;i++){
            prompt+=`${messages[i].role}: ${messages[i].content}\n`;
        }
        prompt+=`END OF HISTORY BLOCK
        Respond to this considering given history:${lastMessage.content}\n`;
        
        // prompt+="This the previous chat history:\n";
            //AAYUSH PROMPT
            // prompt+=`You are a chat with pdf AI assistant
            //AI assistant is a brand new, powerful, human-like artificial intelligence.
            //The traits of AI include expert knowledge, helpfulness and cleverness.
            //AI is a well-behaved and well-mannered individual.
            //AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
            //AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
            //START CONTEXT BLOCK
            //${context}
            //END OF CONTEXT BLOCK
            //AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
            //If the terms in the question are given in the context, but the context does not provide an accurate answer, the AI assistant will answer with it's overall sense.
            //If the context does not have any relation to the question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
            //AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
            //This is the question:${lastMessage.content}`
            // prompt+=`You're a chat with pdf ai assistance.
            
        const generationConfig = {
            temperature: 0.5,
            topK: 3,
            maxOutputTokens:7000,
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
