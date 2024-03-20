import { GoogleGenerativeAI } from "@google/generative-ai";

const config = process.env.GEMINI_API_KEY!
const gemini = new GoogleGenerativeAI(config)
// console.log(gemini)

export async function getEmbeddings(text: string) {
    try {
        const model = await gemini.getGenerativeModel({ 
            model: "embedding-001"
        });
        
    } catch (error) {
        console.log('error calling gemini embeddings',error)
        throw error
    }
}