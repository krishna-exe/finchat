import {GoogleGenerativeAI,HarmCategory,HarmBlockThreshold,} from "@google/generative-ai";
import { GoogleGenerativeAIStream,StreamingTextResponse } from "ai";

export const runtime="edge";
const genai= new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req:Request){
    //TODO: Complete this after understanding message type
    try {
        const {messages}=await req.json();
        console.log(messages[0].content)
        const response=await genai.getGenerativeModel({model:"gemini-pro"})
                .generateContentStream({
            contents:[{role:'user',parts:[{text:messages[0].content}]}]
        });
        const stream=GoogleGenerativeAIStream(response)
        return new StreamingTextResponse(stream)
    } catch (error) {
        console.error(error)
    }
}




        // const generationConfig = {
        //     temperature: 0.9,
        //     topK: 1,
        //     topP: 1,
        //   };
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