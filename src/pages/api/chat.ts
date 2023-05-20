// api/chain-stream.ts
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { templates } from "../../utils/templates";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { PineconeClient } from "@pinecone-database/pinecone";
import { Metadata, getMatchesFromEmbeddings } from "../../utils/matches";
import { summarizeLongDocument } from "../../utils/summarizer";
import { CallbackManager } from "langchain/callbacks";

type Message = {
  role: string;
  content: string;
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export const config = {
  runtime: "edge",
};

const llm = new OpenAI({});

let pinecone: PineconeClient | null = null;

const initPineconeClient = async () => {
  pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (!pinecone) {
    await initPineconeClient();
  }
  const body = await req.json();
  const { messages } = body;

  // get the user's prompt, the last message in the array
  const prompt = messages[messages.length - 1].content;

  // Build an LLM chain that will improve the user prompt
  const inquiryChain = new LLMChain({
    llm,
    prompt: new PromptTemplate({
      template: templates.inquiryTemplate,
      inputVariables: ["userPrompt"],
    }),
  });
  const inquiryChainResult = await inquiryChain.call({
    userPrompt: prompt,
  });
  const inquiry = inquiryChainResult.text;

  // console.log("inquiry ====>", inquiry);

  // Embed the user's intent and query the Pinecone index
  const embedder = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY!,
    modelName: "text-embedding-ada-002",
  });

  const embeddings = await embedder.embedQuery(inquiry);

  // console.log("embeddings ====>", embeddings);

  const matches = await getMatchesFromEmbeddings(embeddings, pinecone!, 3);

  // console.log("matches ====>", matches);

  const urls =
    matches &&
    Array.from(
      new Set(
        matches.map((match) => {
          const metadata = match.metadata as Metadata;
          const { url } = metadata;
          return url;
        })
      )
    );

  console.log("urls ====>", urls);

  const fullDocuments =
    matches &&
    Array.from(
      matches.reduce((map, match) => {
        const metadata = match.metadata as Metadata;
        const { text, url } = metadata;
        if (!map.has(url)) {
          map.set(url, text);
        }
        return map;
      }, new Map())
    ).map(([_, text]) => text);

  const onSummaryDone = (summary: string) => {
    console.log("==== summary DONE ====", summary);
  };

  const summary = await summarizeLongDocument(
    fullDocuments!.join("\n"),
    inquiry,
    onSummaryDone
  );

  // console.log("summary ====>", summary);

  const conversation: string = messages
    .map((message: Message) => `${message.role}: ${message.content}`)
    .join("\n");

  const promptTemplate = new PromptTemplate({
    template: templates.qaTemplate,
    inputVariables: ["summaries", "question", "urls"],
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const onNewToken = (token: string) => {
        const queue = encoder.encode(token);
        controller.enqueue(queue);
      };

      const onEnd = (result: any) => {
        controller.close();
      };

      const chat = new ChatOpenAI({
        streaming: true,
        verbose: true,
        modelName: "gpt-3.5-turbo",
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: onNewToken,
          handleLLMEnd: onEnd,
        }),
      });

      const chain = new LLMChain({
        prompt: promptTemplate,
        llm: chat,
      });

      chain.call({
        summaries: summary,
        question: inquiry,
        urls,
      });
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain;charset=UTF-8",
    },
  });
};

export default handler;
