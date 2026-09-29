import { Bot, LoaderCircle, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "./portfolio-assistant.css";
import { portfolioAnswer } from "../lib/portfolio-answers";
import { useSite } from "../lib/SiteContext";

const reveal = { duration: 0.4, ease: "easeOut" };
const apiUrl = import.meta.env.VITE_ASSISTANT_API_URL?.trim() || "/api/chat";
const suggestions = ["What can Hamdan build?", "Show me his mobile work", "How can I hire Hamdan?"];
const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi — I’m Hamdan’s portfolio assistant. Ask me about his projects, skills or availability.",
};

function MessageContent({ content }) {
  return content.split(/(https:\/\/[^\s]+|\/downloads\/[^\s]+)/g).map((part, index) =>
    /^(https:\/\/|\/downloads\/)/.test(part)
      ? <a key={index} href={part} target={part.startsWith("https:") ? "_blank" : undefined} rel="noreferrer" download={part.endsWith(".apk") || undefined}>{part.startsWith("/downloads/") ? "Download Android APK ↗" : part}</a>
      : part,
  );
}

export default function PortfolioAssistant() {
  const { site } = useSite();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("ready");
  const messageEnd = useRef(null);

  useEffect(() => {
    if (open) messageEnd.current?.scrollIntoView({ block: "nearest" });
  }, [messages, open, sending]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content || sending) return;

    const userMessage = { id: `user-${Date.now()}`, role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter(({ id }) => id !== "welcome")
            .slice(-8)
            .map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.message !== "string" || !payload.message.trim()) throw new Error(payload.error || "The assistant is unavailable right now.");
      setMode(payload.mode === "portfolio" ? "portfolio" : "ai");
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", content: payload.message }]);
    } catch (requestError) {
      setMode("portfolio");
      setError(requestError.name === "AbortError" ? "AI timed out. Showing saved portfolio information." : "AI is currently unavailable. Showing saved portfolio information.");
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", content: portfolioAnswer(content, site) }]);
    } finally {
      window.clearTimeout(timeout);
      setSending(false);
    }
  };

  return (
    <div className="portfolio-assistant">
      <AnimatePresence>
        {open && (
          <motion.section
            className="assistant-panel"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={reveal}
            role="dialog"
            aria-modal="false"
            aria-labelledby="assistant-title"
          >
            <header className="assistant-header">
              <span className="assistant-avatar"><Bot size={20} /></span>
              <div><strong id="assistant-title">Ask {site.profile.brand} AI</strong><small><i /> {mode === "portfolio" ? "Portfolio guide · saved answers" : mode === "ai" ? "AI connected" : "Portfolio assistant"}</small></div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setOpen(false)} aria-label="Close AI assistant"><X size={18} /></motion.button>
            </header>

            <div className="assistant-messages" role="log" aria-live="polite">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div key={message.id} className={"assistant-message is-" + message.role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={reveal}>
                    <MessageContent content={message.content} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {messages.length === 1 && (
                <div className="assistant-suggestions">
                  {suggestions.map((suggestion) => (
                    <motion.button key={suggestion} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => sendMessage(suggestion)}>{suggestion}</motion.button>
                  ))}
                </div>
              )}

              {sending && <div className="assistant-typing"><i /><i /><i /><span>Thinking</span></div>}
              {error && <div className="assistant-error" role="alert">{error}</div>}
              <div ref={messageEnd} />
            </div>

            <form className="assistant-form" onSubmit={(event) => { event.preventDefault(); sendMessage(input); }}>
              <label htmlFor="assistant-input">Ask about the portfolio</label>
              <div>
                <input id="assistant-input" value={input} onChange={(event) => setInput(event.target.value.slice(0, 1000))} placeholder="Ask about projects or skills…" autoComplete="off" disabled={sending} />
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={sending || !input.trim()} aria-label="Send message">
                  {sending ? <LoaderCircle className="assistant-spinner" size={18} /> : <Send size={18} />}
                </motion.button>
              </div>
              <small><Sparkles size={12} /> {mode === "portfolio" ? "Saved portfolio facts · AI connection unavailable" : "Ask about Hamdan’s work · avoid sensitive data"}</small>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        className="assistant-launcher"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        {open ? <X size={21} /> : <span className="assistant-launcher-symbol" aria-hidden="true"><Bot size={22} /><Sparkles size={11} /></span>}
        <span>{open ? "Close" : "AI Assistant"}</span>
      </motion.button>
    </div>
  );
}
