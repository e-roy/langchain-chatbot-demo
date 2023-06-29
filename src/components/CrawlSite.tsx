import { useState } from "react";

export const CrawlSite = () => {
  const [crawlUrl, setCrawlUrl] = useState("");
  const [activeUrl, setActiveUrl] = useState("");

  const handleCrawl = async (event: React.FormEvent) => {
    event.preventDefault();
    setActiveUrl("Crawling...");

    const response = await fetch(`/api/crawl?urls=${crawlUrl}&limit=20`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      setActiveUrl("ERROR");
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      setActiveUrl(crawlUrl);
    }
  };
  return (
    <>
      <form onSubmit={handleCrawl} style={{ display: "flex", padding: "10px" }}>
        <input
          type="text"
          style={{ flex: 1, padding: "8px", borderRadius: "8px" }}
          value={crawlUrl}
          onChange={(e) => setCrawlUrl(e.target.value)}
          placeholder="Enter URL to crawl"
        />
        <button
          type={`submit`}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            borderRadius: "8px",
          }}
        >
          Crawl
        </button>
      </form>
      <div style={{ padding: "8px" }}>Active site :{activeUrl}</div>
    </>
  );
};
