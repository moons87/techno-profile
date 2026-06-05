import { useCallback, useRef, useState } from "react";

/**
 * Управляет историей переписки и чтением стримингового ответа от /api/chat.
 * История целиком отправляется на каждый запрос (Claude API без состояния).
 */
export function useChat({ profile, locale }) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const profileRef = useRef(profile);
  profileRef.current = profile;
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      setError(null);
      const userMessage = { role: "user", content: trimmed };
      const history = [...messages, userMessage];
      setMessages([...history, { role: "assistant", content: "" }]);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            profile: profileRef.current,
            locale: localeRef.current,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          accumulated += decoder.decode(value, { stream: true });
          setMessages((previous) => {
            const next = [...previous];
            next[next.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
            return next;
          });
        }
      } catch (caught) {
        setError(caught);
        // Убрать пустой ответ ассистента, чтобы показать ошибку чисто.
        setMessages((previous) => previous.slice(0, -1));
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming],
  );

  return { messages, isStreaming, error, sendMessage };
}
