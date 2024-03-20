import { Pinecone } from '@pinecone-database/pinecone';
import { DownloadFromS3 } from './s3-server';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
const index = pc.index('reports');

export async function LoadS3IntoPinecone(fileKey: string){
    // Get PDF
    console.log('Downloading file from S3')
    const file_name=await DownloadFromS3(fileKey);
    if(!file_name){
      throw new Error('Not download');
    }
    const loader = new PDFLoader(file_name);
    const pages = await loader.load();
    return pages;
}