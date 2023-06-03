// api/chat-history.ts
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CallbackManager } from "langchain/callbacks";
import { Chroma } from "langchain/vectorstores/chroma";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatMessageHistory } from "langchain/memory";

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const modelDefault = new ChatOpenAI({
  temperature: 0.2, // increase temepreature to get more creative answers
  modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
});

export const makeChain = (vectorstore: Chroma, model: ChatOpenAI) => {
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model ? model : modelDefault,
    vectorstore.asRetriever(),
    {
      questionGeneratorChainOptions: {
        llm: model ? model : modelDefault,
        template: CONDENSE_PROMPT,
      },
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
      // verbose: true,
    }
  );
  return chain;
};

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

      // create chain
      const chain = makeChain(vectorStore, model);
      //Ask a question using chat history
      await chain.call({
        question,
        chat_history: new ChatMessageHistory(conversation),
        verbose: true,
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
