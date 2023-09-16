import "../styles/globals.css";
export const metadata = {
  title: "Simple url Chat",
  description: "Open AI, Langchain, Chroma chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
