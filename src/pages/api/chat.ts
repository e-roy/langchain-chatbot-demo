// api/chat.ts
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CallbackManager } from "langchain/callbacks";
import { Chroma } from "langchain/vectorstores/chroma";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { RetrievalQAChain } from "langchain/chains";

function jsonToConversation(
  json: Message[]
): (HumanChatMessage | SystemChatMessage)[] {
  const conversation: (HumanChatMessage | SystemChatMessage)[] = [];

  for (let i = 0; i < json.length; i++) {
    if (json[i].role === "user") {
      if (i === json.length - 1) {
        continue;
      }
      conversation.push(new HumanChatMessage(json[i].content));
    } else {
      conversation.push(new SystemChatMessage(json[i].content));
    }
  }

  return conversation;
}

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

const handler = async (req: Request): Promise<Response> => {
  const body = await req.json();
  const { messages } = body;

  // get the user's question, the last message in the array
  const question = messages[messages.length - 1].content;

  const conversation = jsonToConversation(messages);
  // console.log("conversation", conversation);

  const vectorStore = await Chroma.fromExistingCollection(
    new OpenAIEmbeddings(),
    { collectionName: "website-collection" }
  );

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

      const model = new ChatOpenAI({
        streaming: true,
        modelName: "gpt-3.5-turbo",
        temperature: 0.2,
        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: onNewToken,
          handleLLMEnd: onEnd,
        }),
      });

      // I wanted to use ConversationalRetrievalQAChain, but was experiencing some issues
      // - the user's question was being returned as a response
      // - caused issues with handleLLMNewToken and handleLLMEnd
      // conversation is available for history, but not used
      const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
        returnSourceDocuments: true, //The number of source documents returned is 4 by default
        // verbose: true,
      });
      chain.call({
        query: question,
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
