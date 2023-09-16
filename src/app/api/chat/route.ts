// api/chat/route.ts
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import { RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const runtime = "nodejs";

const promptTemplate = `Use the following pieces of context to answer the question at the end.  Be sure to list all urls for reference. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Answer in Markdown:`;

const prompt = PromptTemplate.fromTemplate(promptTemplate);

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

  const chain = new RetrievalQAChain({
    combineDocumentsChain: loadQAStuffChain(llm, { prompt }),
    retriever: vectorStore.asRetriever(),
  });

  chain.call({
    query: question,
  });

  return new StreamingTextResponse(stream);
}
