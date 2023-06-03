# Langchain Chatbot Demo

This is a simple demo using Langchain, OpenAI and Chroma.

To run this demo, you need to have:

1. A Chroma client using Docker - [docs.trychroma.com](https://docs.trychroma.com/).
2. An OpenAI account. If you don't have one, you can sign up for free at [openai.com](https://www.openai.com).

## What it does

A simple chatbot to interact with any website that you enter in the top input field. In local development only.

## Setup

1. Create a Chroma client using Docker

```
git clone git@github.com:chroma-core/chroma.git
cd chroma
docker-compose up -d --build
```

2. Clone this repository

```bash
git clone https://github.com/e-roy/langchain-chatbot-demo.git
```

3. Install dependencies

```bash
cd langchain-chatbot-demo
yarn install
```

4. Create a `.env` file in the root directory of the project and add your API keys:

```
OPENAI_API_KEY=...
```

## Start the development server

```bash
yarn dev
```
