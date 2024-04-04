import {GoogleGenerativeAI,} from "@google/generative-ai";
import { GoogleGenerativeAIStream,StreamingTextResponse,Message } from "ai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import Markdown from 'react-markdown'

export const runtime="edge";

const genai= new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// const buildGoogleGenAIPrompt = (messages: object) => ({
//     contents: messages
//       .filter((message:object) => message.role === 'user' || message.role === 'assistant')
//       .map((message:object) => ({
//         role: message.role === 'user' ? 'user' : 'model',
//         parts: [{ text: message.content }],
//       })),
//   });

// export async function POST(req:Request){
//     try {
//         const {messages}=await req.json();
//         console.log(typeof messages)
//         const response=await genai.getGenerativeModel({model:"gemini-pro"})
//             .generateContentStream(...messages.filter())
//         //         .generateContentStream({
//         //     contents:[{role:'user',parts:[{text:messages[0].content}]}]
//         // });
//         const stream=GoogleGenerativeAIStream(response)
//         return new StreamingTextResponse(stream)
//     } catch (error) {
//         console.error(error)
//     }
// }

export async function POST(req:Request){
    try {
        const {messages, chatId}=await req.json();
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
        if (_chats.length != 1) {
            return NextResponse.json({ error: "chat not found" }, { status: 404 });
          }
        const fileKey = _chats[0].fileKey;
        const lastMessage = messages[messages.length - 1];
        const context = await getContext(lastMessage.content, fileKey);
        console.log(`${context}`)

        // console.log(messages[messages.length - 1].content)
        let prompt="These are your previous messages\n";
        for(let i=0;i<messages.length-1;i++){
            prompt+=`${messages[i].content}\n`;
        }
        
        prompt+=`
        Your name is FinChat.
        You are a chat with annual report assistant.
        AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness and cleverness.
        I have provided you with a context which is in the block named context. 
        The user chats with FinChat to understand the paper.
        You have to answer the questions of the user. 
        Be friendly and cheerful.
        Act like a human and explain the terms used in your reponse so that the user understands what the content is all about.
        Make sure the language is simple and easy to understand. 
        Access the internet . 
        Use proper maths and conversions.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        If the terms in my question are not given in the context, but the context does not provide an accurate answer, you can answer with your overall sense.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        This is my question:    ${lastMessage.content}\n`
            
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
            topK: 1,
            topP: 1,
            maxOutputTokens:2000,
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
                    content:completion,
                    role:'system',
                });
            },
        });
            // console.log(lastMessage)
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.error(error)
    }
}

// const stream = GoogleGenerativeAIStream(response, {
//     onStart: async () => {
//       // save user message into db
//       await db.insert(_messages).values({
//         chatId,
//         content: lastMessage.content,
//         role: "user",
//       });
//     },
//     onCompletion: async (completion) => {
//       // save ai message into db
//       await db.insert(_messages).values({
//         chatId,
//         content: completion,
//         role: "system",
//       });
//     },
//   });



        // const safetySettings = [
        //     {
        //       category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        //     },
        //     {
        //       category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        //     },
        //     {
        //       category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        //     },
        //     {
        //       category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        //       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        //     },
        //   ];
        //   const chat = model.startChat({
        //       generationConfig,
        //       safetySettings,
        //       history: [],
        //     });
        //     console.log('kjjujas')
        //     const result = await chat.sendMessage(messages[0].content);
        //     const response = result.response;
        // console.log(response);


// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { GoogleGenerativeAIStream,StreamingTextResponse } from "ai";
// // import { getContext } from "@/lib/context";
// import { db } from "@/lib/db";
// import { chats, messages as _messages } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
// import { NextResponse } from "next/server";
// const { messages, chatId } = await req.json();
// const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
// if (_chats.length != 1) {
//   return NextResponse.json({ error: "Chat not found" }, { status: 404 });
// }
// const fileKey = _chats[0].fileKey;
// const lastMessage = messages[messages.length - 1];
// // const context = await getContext(lastMessage.content, fileKey);

// // const prompt = {
// //     role: "system",
// //     content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
// //     The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
// //     AI is a well-behaved and well-mannered individual.
// //     AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
// //     AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
// //     AI assistant is a big fan of Pinecone and Vercel.
// //     START CONTEXT BLOCK
// //     ${context}
// //     END OF CONTEXT BLOCK
// //     AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
// //     If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
// //     AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
// //     AI assistant will not invent anything that is not drawn directly from the context.
// //     `,
// //   };
// const response=await genai
//     .getGenerativeModel({model:'gemini-pro'})
//     // .generateContentStream({
//     //     contents:[{role:'user',parts:[{text:prompt}]}]
//     // });
// // const stream=GoogleGenerativeAIStream(response)
// // return new StreamingTextResponse(stream)



  