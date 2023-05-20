# Pinecone Chatbot Demo

This is a simple demo using Langchain, OpenAI and Pinecone. This was based from the `https://github.com/pinecone-io/chatbot-demo` demo.

To run this demo, you need to have:

1. A Pinecone account. If you don't have one, you can sign up for free at [pinecone.io](https://www.pinecone.io).
2. An OpenAI account. If you don't have one, you can sign up for free at [openai.com](https://www.openai.com).

## What it does

A simple chatbot to interact with any website doc that is crawled and indexed in Pinecone. In local development only, developer can crawl any website that is in the variable `NEXT_PUBLIC_CRAWL_URL` in the `.env`. A button at the bottom of the page labeled "crawl", that only shows up in development only, will initiates crawlling the website. Once finished, user can ask questions about the docs.

## Setup

1. Clone this repository

```bash
git clone https://github.com/e-roy/langchain-chatbot-demo.git
```

2. Install dependencies

```bash
cd langchain-chatbot-demo
npm install
```

1. Create your Pinecone and OpenAI accounts and get your API keys

2. Create your Pinecone index

3. Create a `.env` file in the root directory of the project and add your API keys:

```
OPENAI_API_KEY=...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=...
API_ROOT="http://localhost:3000"
NEXT_PUBLIC_CRAWL_URL=
```

## Start the development server

```bash
npm run dev
```
