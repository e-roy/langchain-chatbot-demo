"use client";
// components/CrawlSite.tsx
import { useState, ChangeEvent, FormEvent } from "react";

interface FetchResponse {
  ok: boolean;
  status: number;
}

export const CrawlSite = () => {
  const [crawlUrl, setCrawlUrl] = useState<string>("");
  const [activeUrl, setActiveUrl] = useState<string>("");

  const handleCrawl = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveUrl("Crawling...");

    const response: FetchResponse = await fetch(
      `/api/crawl?urls=${crawlUrl}&limit=20`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      setActiveUrl("ERROR");
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      setActiveUrl(crawlUrl);
    }
  };

  return (
    <>
      <form onSubmit={handleCrawl}>
        <input
          type="text"
          value={crawlUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCrawlUrl(e.target.value)
          }
          placeholder="Enter URL to crawl"
        />
        <button type="submit">Crawl</button>
      </form>
      <div style={{ padding: "8px" }}>Active site: {activeUrl}</div>
    </>
  );
};
