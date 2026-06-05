import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useChat } from "../chat/useChat";

function ChatDrawer({ open, onOpen, onClose, profile, locale, text }) {
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
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            className="chat-fab"
            onClick={onOpen}
            aria-label={text.chatOpen}
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <span className="chat-fab-icon" aria-hidden="true">
              💬
            </span>
            {text.chatOpen}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            className="chat-drawer"
            role="dialog"
            aria-label={text.chatTitle}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
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
      </AnimatePresence>
    </>,
    document.body,
  );
}

export default ChatDrawer;
