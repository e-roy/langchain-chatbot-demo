"use client";

export const runtime = "edge";

import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import * as timeago from "timeago.js";
import { Message, useChat } from "ai/react";
import { CrawlSite } from "../components/CrawlSite";

export default function IndexPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(scrollToBottom, [messages]);

  return (
    <div style={{ height: "95vh", display: "flex", flexDirection: "column" }}>
      <CrawlSite />

      <div style={{ flex: 1, overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((message: Message) => (
          <div key={message.id}>
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
                margin: "10px",
              }}
            >
              <div
                style={{
                  backgroundColor:
                    message.role === "user" ? "#e2e8f0" : "#edf2f7",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <ReactMarkdown
                  components={{
                    pre: ({ node, ...props }) => (
                      <pre
                        style={{
                          backgroundColor: "#2B2B2B",
                          color: "#fff",
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                        }}
                        {...props}
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
                margin: "10px",
                fontSize: "12px",
                padding: "0 10px",
              }}
            >
              {timeago.format(message?.createdAt as timeago.TDate)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", padding: "10px" }}
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          style={{ flex: 1, padding: "8px", borderRadius: "8px" }}
          placeholder="Ask a question about this site"
        />
        <button
          type="submit"
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            borderRadius: "8px",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
