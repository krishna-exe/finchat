import { GoogleGenerativeAI } from "@google/generative-ai";

const config = process.env.GEMINI_API_KEY!
const gemini = new GoogleGenerativeAI(config)
// console.log(gemini)

export async function getEmbeddings(text: string) {
    try {
        const embeddingModel = gemini.getGenerativeModel({
            model: "embedding-001"
        });
        const response = await embeddingModel.embedContent(text.replace(/\n/g, ' '));
        return response.embedding.values as number[]
    } catch (error) {
        console.log('error calling gemini embeddings',error)
        throw error
    }
}