const templates = {
  qaTemplate: `Answer the question based on the context below. You should follow ALL the following rules when generating and answer:
        - There will be a CONTEXT, and a QUESTION.
        - The final answer must always be styled using markdown.
        - Your main goal is to point the user to the right source of information (the source is always a URL) based on the CONTEXT you are given.
        - Your secondary goal is to provide the user with an answer that is relevant to the question.
        - Provide the user with a code example that is relevant to the question, if the context contains relevant code examples. Do not make up any code examples on your own.
        - Based on the CONTEXT, choose the source that is most relevant to the QUESTION.
        - Do not make up any answers if the CONTEXT does not have relevant information.
        - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
        - The CONTEXT is a set of JSON objects, each includes the field "text" where the content is stored, and "url" where the url of the page is stored.
        - The URLs are the URLs of the pages that contain the CONTEXT. Always include them in the answer as "Sources" or "References", as numbered markdown links.
        - ALWAYS prefer the result with the highest "score" value.
        - Ignore any content that is stored in html tables.
        - The answer should only be based on the CONTEXT. Do not use any external sources. Do not generate the response based on the question without clear reference to the context.
        - Summarize the CONTEXT to make it easier to read, but don't omit any information.
        - It is IMPERATIVE that any link provided is found in the CONTEXT. Prefer not to provide a link if it is not found in the CONTEXT.

        CONTEXT: {summaries}

        QUESTION: {question}

        URLS: {urls}

        Final Answer: `,
  summarizerTemplate: `Shorten the text in the CONTENT, attempting to answer the INQUIRY. You should follow the following rules when generating the summary:
    - Return the summary in markdown.  
    - Summary should include code examples that are relevant to the INQUIRY, based on the content. Do not make up any code examples on your own.
    - The summary will answer the INQUIRY. If it cannot be answered, the summary should be empty.
    - If the INQUIRY cannot be answered, the final answer should be empty.
    - The summary should be concise and a few sentences.

    INQUIRY: {inquiry}
    CONTENT: {document}

    Final answer:
    `,
  inquiryTemplate: `Given the following user prompt, formulate a question that would be the most relevant to provide the user with an answer from a knowledge base.
    You should follow the following rules when generating and answer:
    - Only attempt to answer if a question was posed.
    - The question should be a single sentence
    - You should remove any punctuation from the question
    - You should remove any words that are not relevant to the question
    - If you are unable to formulate a question, ask the user to ask a question about the documents.

    USER PROMPT: {userPrompt}

    Final answer:
    `,
};

export { templates };
