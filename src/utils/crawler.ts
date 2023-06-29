import fetch from "node-fetch";
import { load } from "cheerio";

export type Page = {
  url: string;
};

class Crawler {
  pages: Page[] = [];
  limit: number = 1000;
  urls: string[] = [];
  count: number = 0;
  visited: { [key: string]: boolean } = {}; // Keep track of visited URLs

  constructor(urls: string[], limit: number = 1000) {
    this.urls = urls;
    this.limit = limit;
    this.count = 0;
    this.pages = [];
  }

  handleRequest = async (url: string) => {
    if (this.visited[url]) return; // Skip URLs that have already been visited
    this.visited[url] = true;

    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = load(html);
      $("script").remove();
      $("style").remove();

      const page: Page = {
        url: url,
      };
      this.pages.push(page);

      const promises: Promise<void>[] = [];

      $("a").each((i, el) => {
        const href = $(el).attr("href")?.split("#")[0];
        if (href) {
          const fullUrl = new URL(href, url).href;
          if (
            !fullUrl.startsWith("data:") &&
            fullUrl.length < 2048 &&
            this.urls.some((u) => fullUrl.includes(u)) &&
            this.count < this.limit
          ) {
            promises.push(this.handleRequest(fullUrl));
            this.count++;
          }
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error(`Failed to fetch page content from ${url}: ${error}`);
    }
  };

  start = async () => {
    this.pages = [];
    for (const url of this.urls) {
      await this.handleRequest(url);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay of 1 second between each request
    }
    return this.pages;
  };
}

export { Crawler };
