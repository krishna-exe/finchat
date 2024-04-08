import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { DownloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
import { MilvusClient, InsertReq, DataType } from '@zilliz/milvus2-sdk-node';

export const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
// export const ms=new MilvusClient({
//   address:'localhost:19530',
//   username:process.env.MILVUS_USERNAME,
//   password:process.env.MILVUS_PASSWORD,
// });
const index = pc.index('reports');
type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};
export async function LoadS3IntoPinecone(fileKey: string){
    //1. Get PDF
    console.log('Downloading file from S3')
    const file_name=await DownloadFromS3(fileKey);
    if(!file_name){
      throw new Error('Not download');
    }
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    //2. split and segment pdf
    //pages = Array(13)
    const documents = await Promise.all(pages.map(prepareDocument));
    
    //3. vectorize and embed individual docs
    const vectors = await Promise.all(documents.flat().map(embedDocument))
    //upload to pinecone
    // const coll_name=convertToAscii(fileKey)
    // await ms.createCollection({
    //   collection_name:coll_name,
    //   fields:[
    //     {
    //       name:'id',
    //       description:'ID Field',
    //       data_type:DataType.Int64,
    //       is_primary_key:true,
    //       autoID:true,
    //     },
    //     {
    //       name:'values',
    //       description:'Embedding Field',
    //       data_type:DataType.FloatVector,
    //       dim:768,
    //     }
    //   ]
    // });
    // const params:InsertReq={
    //   collection_name:coll_name,
    //   fields_data:vectors,
    // };
    // await ms.insert(params);
    // console.log('Uploaded to Milvus')
    const namespace = index.namespace(convertToAscii(fileKey));
    console.log('Uploading to Pinecone')
    await namespace.upsert(vectors);
    console.log('Upload complete')

    // return pages;

    // const client = await getPineconeClient();
    // const pineconeIndex = await client.index("chatpdf");
    // const sd = pineconeIndex.namespace(convertToAscii(fileKey));
  
    // console.log("inserting vectors into pinecone");
    // await namespace.upsert(vectors);
  
    return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    }as PineconeRecord;
  } catch (error) {
    console.error("Error embedding document", error);
    throw error;
  }
}


export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};


async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "")
  // console.log(pageContent);
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 5000,
  });
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 3600),
      },
    }),
  ]);
  // console.log(docs)
  return docs;
}


