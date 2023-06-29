// api/chat/route.ts
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import { RetrievalQAChain } from "langchain/chains";

import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const { stream, handlers } = LangChainStream();

  // get the user's question, the last message in the array
  const question = messages[messages.length - 1].content;

  const vectorStore = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings(),
    { collectionName: "website-collection" }
  );

  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.2,
    streaming: true,
    callbacks: [handlers],
  });

  const chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(), {
    returnSourceDocuments: true, //The number of source documents returned is 4 by default
    // verbose: true,
  });
  chain.call({
    query: question,
  });

  return new StreamingTextResponse(stream);
}
