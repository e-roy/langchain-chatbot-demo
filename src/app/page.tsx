"use client";
import React, { useRef, useEffect, ChangeEvent } from "react";
import * as timeago from "timeago.js";
import { Message, useChat } from "ai/react";
import { CrawlSite } from "../components/CrawlSite";
import { MarkDownDisplay } from "../components/MarkdownDisplay";

export default function IndexPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: "chat-12345", // this is the id of this chatbot
    api: `/api/chat`, // this is the path to the chatbot api
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="indexPage-container">
      <CrawlSite />

      <div className="message-container">
        {messages.map((message: Message) => (
          <div key={message.id}>
            <div className={`message-div ${message.role}`}>
              <div className={`markdown-div ${message.role}`}>
                <MarkDownDisplay content={message.content} />
              </div>
            </div>
            <div className={`time-div ${message.role}`}>
              {timeago.format(message.createdAt as timeago.TDate)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
          placeholder="Ask a question about this site"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
