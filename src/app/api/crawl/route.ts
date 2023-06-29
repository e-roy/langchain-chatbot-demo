// api/crawl.ts
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TokenTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { Crawler, Page } from "../../../utils/crawler";

import { ChromaClient } from "chromadb";
import { Chroma } from "langchain/vectorstores/chroma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest, res: NextResponse) {
  const urlString = req.nextUrl.searchParams.get("urls");
  const urls = (urlString as string).split(",");
  const limit = req.nextUrl.searchParams.get("limit");

  const client = new ChromaClient();

  const crawlLimit = parseInt(limit as string) || 100;

  let pages: Page[] = [];
  try {
    const crawler = new Crawler(urls, crawlLimit);
    pages = (await crawler.start()) as Page[];
    console.log("pages length ====>  ", pages.length);
  } catch (e) {
    console.log("Error in crawling process ====>", e);
    return NextResponse.json({
      message: "Error in crawling process",
      error: e,
    });
  }

  const documents: Document[] = [];

  for (const singlePage of pages) {
    const loader = new CheerioWebBaseLoader(singlePage.url);
    const docs = await loader.load();

    const splitter = new TokenTextSplitter({
      encodingName: "gpt2",
      chunkSize: 300,
      chunkOverlap: 20,
    });

    for (const doc of docs) {
      const splitDocs = await splitter.splitDocuments([doc]);
      documents.push(...splitDocs);
    }
  }

  console.log("total documents length ====>  ", documents.length);

  try {
    await client.deleteCollection({
      name: "website-collection",
    });
    Chroma.fromDocuments(
      documents,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY!,
        modelName: "text-embedding-ada-002",
      }),
      {
        collectionName: "website-collection",
      }
    );
  } catch (e) {
    console.log("ERROR HERE ====>", e);
    return NextResponse.json({ message: "Error" });
  }

  console.log("Done");
  return NextResponse.json({ message: "Done" });
}
