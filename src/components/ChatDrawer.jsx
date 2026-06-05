import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "../chat/useChat";

function ChatDrawer({ open, onClose, profile, locale, text }) {
  const { messages, isStreaming, error, sendMessage } = useChat({
    profile,
    locale,
  });
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const submit = (value) => {
    sendMessage(value);
    setDraft("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submit(draft);
  };

  return createPortal(
    <AnimatePresence>
      {open && (
          <motion.aside
            className="chat-drawer"
            role="dialog"
            aria-label={text.chatTitle}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <header className="chat-header">
              <div>
                <strong>{text.chatTitle}</strong>
                <span>{text.chatSubtitle}</span>
              </div>
              <button
                type="button"
                className="chat-close"
                onClick={onClose}
                aria-label={text.chatClose}
              >
                ×
              </button>
            </header>

            <div className="chat-messages" ref={scrollRef}>
              <div className="chat-bubble assistant">{text.chatGreeting}</div>

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`chat-bubble ${message.role}`}
                >
                  {message.content ||
                    (message.role === "assistant" && isStreaming ? "…" : "")}
                </div>
              ))}

              {error && <div className="chat-bubble error">{text.chatError}</div>}
            </div>

            {messages.length === 0 && (
              <div className="chat-suggestions">
                {text.chatSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submit(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form className="chat-input" onSubmit={handleSubmit}>
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={text.chatPlaceholder}
                disabled={isStreaming}
              />
              <button type="submit" disabled={isStreaming || !draft.trim()}>
                {text.chatSend}
              </button>
            </form>
          </motion.aside>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default ChatDrawer;
