import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const client = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });
    const index = client.index('reports1');
    const namespace = index.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 3,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
    
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  
  // console.log("------------------------------------------------\nThese are the qualifying docs\n--------------------------\n"+matches+" ")
  const qualifyingDocs = matches.filter(
      (match) => match.score && match.score > 0.6
  );
      
  type Metadata = {
      text: string;
      pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // 5 vectors
  // console.log(docs)
  return docs.join("\n");
}
