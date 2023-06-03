// api/crawl.ts
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TokenTextSplitter } from "langchain/text_splitter";
import { NextApiRequest, NextApiResponse } from "next";
import { Crawler, Page } from "../../utils/crawler";

import { ChromaClient } from "chromadb";
import { Chroma } from "langchain/vectorstores/chroma";

type Response = {
  message: string;
};

const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (process.env.NODE_ENV !== "development") {
    res.status(500).json({ message: "Only allowed in development mode only" });
    return;
  }

  const client = new ChromaClient();

  const allCollections = await client.listCollections();
  console.log("allCollections", allCollections);

  const { query } = req;
  const { urls: urlString, limit } = query;
  const urls = (urlString as string).split(",");
  const crawlLimit = parseInt(limit as string) || 100;

  const crawler = new Crawler(urls, crawlLimit, 200);
  const pages = (await crawler.start()) as Page[];
  console.log("pages length ====>  ", pages.length);

  const documents = await Promise.all(
    pages.map((singlePage) => {
      const splitter = new TokenTextSplitter({
        encodingName: "gpt2",
        chunkSize: 300,
        chunkOverlap: 20,
      });
      const docs = splitter.splitDocuments([
        new Document({
          pageContent: singlePage.text,
          metadata: {
            url: singlePage.url,
            text: truncateStringByBytes(singlePage.text, 36000),
          },
        }),
      ]);

      return docs;
    })
  );

  const allSplit = () => {
    let all: Document[] = [];
    documents.forEach((doc) => {
      all = [...all, ...doc];
    });
    return all;
  };

  const documentsArray = allSplit();
  console.log("total documents length ====>  ", documentsArray.length);

  try {
    await client.deleteCollection({
      name: "website-collection",
    });
    Chroma.fromDocuments(
      documentsArray,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY!,
        modelName: "text-embedding-ada-002",
      }),
      {
        collectionName: "website-collection",
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error" });
  }

  res.status(200).json({ message: "Done" });
}
