# ИИ-консультант по профориентации — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить встроенный чат с ИИ-консультантом, который автоматически
получает результаты профориентационной игры и даёт персональные рекомендации, и
задеплоить приложение на Vercel.

**Architecture:** Чистая функция собирает профиль игрока из состояния игры.
Выезжающая панель (drawer) на экране результатов общается с Vercel
serverless-функцией `/api/chat`, которая хранит ключ API и проксирует
стриминговый ответ Claude Sonnet 4.6. Ключ API живёт только на сервере.

**Tech Stack:** React 19, Vite 6, framer-motion, `@anthropic-ai/sdk`
(claude-sonnet-4-6, streaming), Vercel serverless functions, vitest (unit-тесты).

**Спецификация:** `docs/superpowers/specs/2026-06-05-ai-career-consultant-chat-design.md`

---

## File Structure

- `src/chat/gameProfile.js` — **создать.** Чистая функция `buildGameProfile`,
  собирает единый объект профиля игрока (like/skip, интересы, архетип, топ-3
  специальности с процентами, комбо).
- `src/chat/gameProfile.test.js` — **создать.** Unit-тесты для `buildGameProfile`.
- `api/chat.js` — **создать.** Vercel serverless function: system-prompt + стрим
  Claude.
- `src/chat/useChat.js` — **создать.** Хук: история сообщений + чтение стрима.
- `src/components/ChatDrawer.jsx` — **создать.** UI выезжающей панели чата.
- `src/data.js` — **изменить.** Добавить локализованные строки чата в `localeText`.
- `src/App.jsx` — **изменить.** Отслеживание `decisions`, кнопка-триггер, рендер
  drawer.
- `src/styles.css` — **изменить.** Стили чата.
- `package.json` — **изменить.** Зависимости + скрипт `test`.
- `.gitignore` — **изменить.** Игнорировать `.env*` (кроме примера).
- `.env.example` — **создать.** Шаблон переменной `ANTHROPIC_API_KEY`.

---

## Task 1: Зависимости и конфигурация проекта

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Установить runtime- и dev-зависимости**

Run:
```bash
npm install @anthropic-ai/sdk
npm install -D vitest
```
Expected: обе команды завершаются успешно, `@anthropic-ai/sdk` появляется в
`dependencies`, `vitest` — в `devDependencies` в `package.json`.

- [ ] **Step 2: Добавить скрипт `test` в `package.json`**

В объекте `"scripts"` добавить строку (после `"preview"`):
```json
    "preview": "vite preview --host 0.0.0.0 --port 4173",
    "test": "vitest run"
```
(Запятая после строки `preview` обязательна.)

- [ ] **Step 3: Игнорировать секреты в `.gitignore`**

Добавить в конец `.gitignore`:
```
.env
.env.local
.env.*.local
```

- [ ] **Step 4: Создать `.env.example`**

Создать файл `.env.example` с содержимым:
```
# Ключ Anthropic API для ИИ-консультанта.
# Получить на https://console.anthropic.com/ и скопировать в .env (локально)
# или в Environment Variables проекта на Vercel.
ANTHROPIC_API_KEY=
```

- [ ] **Step 5: Проверить, что тест-раннер запускается**

Run: `npx vitest run`
Expected: vitest стартует и сообщает «No test files found» (тестов ещё нет) —
это нормально и подтверждает, что инструмент установлен.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example
git commit -m "chore: add anthropic sdk, vitest, env config for AI chat"
```

---

## Task 2: Чистая функция `buildGameProfile` (TDD)

**Files:**
- Create: `src/chat/gameProfile.test.js`
- Create: `src/chat/gameProfile.js`

- [ ] **Step 1: Написать падающий тест**

Создать `src/chat/gameProfile.test.js`:
```js
import { describe, expect, it } from "vitest";
import { buildGameProfile } from "./gameProfile";

const cards = [
  { id: 1, title: { ru: "Нет интернета", kz: "Интернет жоқ" } },
  { id: 2, title: { ru: "Идея приложения", kz: "Қосымша идеясы" } },
  { id: 3, title: { ru: "Слабый сигнал", kz: "Әлсіз сигнал" } },
];

const localeText = {
  ru: {},
  kz: {},
};

const baseArgs = {
  scores: { logic: 4, create: 2 },
  decisions: [
    { cardId: 1, outcome: "like" },
    { cardId: 2, outcome: "skip" },
    { cardId: 3, outcome: "like" },
  ],
  rankedPowers: [
    { key: "logic", value: 4, name: "Логик", description: "Анализ" },
    { key: "create", value: 2, name: "Создатель", description: "Творчество" },
  ],
  recommendations: [
    {
      specialtyScore: 8,
      title: { ru: "Разработчик ПО", kz: "БҚ әзірлеуші" },
      program: { ru: "Программное обеспечение", kz: "БҚ" },
      blurb: { ru: "Пишет код", kz: "Код жазады" },
    },
    {
      specialtyScore: 4,
      title: { ru: "Сетевой админ", kz: "Желі әкімшісі" },
      program: { ru: "Сети", kz: "Желілер" },
      blurb: { ru: "Сервера", kz: "Серверлер" },
    },
  ],
  archetype: {
    title: { ru: "Кодовый архитектор", kz: "Код сәулетшісі" },
    summary: { ru: "Строит решения", kz: "Шешім құрады" },
  },
  resultHero: { title: { ru: "Создатель приложений", kz: "Қосымша жасаушы" } },
  comboTrail: [{ title: { ru: "Режим разработки", kz: "Әзірлеу режимі" } }],
  cards,
  localeText,
  locale: "ru",
};

describe("buildGameProfile", () => {
  it("разделяет понравившиеся и отклонённые карточки по заголовкам", () => {
    const profile = buildGameProfile(baseArgs);
    expect(profile.likedCards).toEqual(["Нет интернета", "Слабый сигнал"]);
    expect(profile.skippedCards).toEqual(["Идея приложения"]);
  });

  it("нормализует процент соответствия к лучшей специальности (100%)", () => {
    const profile = buildGameProfile(baseArgs);
    expect(profile.recommendations[0].matchPercent).toBe(100);
    expect(profile.recommendations[1].matchPercent).toBe(50);
  });

  it("ставит 0% всем, когда все очки специальностей нулевые", () => {
    const profile = buildGameProfile({
      ...baseArgs,
      recommendations: baseArgs.recommendations.map((r) => ({
        ...r,
        specialtyScore: 0,
      })),
    });
    expect(profile.recommendations.every((r) => r.matchPercent === 0)).toBe(true);
  });

  it("использует выбранный язык для всех текстов", () => {
    const profile = buildGameProfile({ ...baseArgs, locale: "kz" });
    expect(profile.likedCards).toEqual(["Интернет жоқ", "Әлсіз сигнал"]);
    expect(profile.recommendations[0].title).toBe("БҚ әзірлеуші");
    expect(profile.archetype.title).toBe("Код сәулетшісі");
    expect(profile.combos).toEqual(["Әзірлеу режимі"]);
  });

  it("включает интересы (суперсилы) с числовыми значениями", () => {
    const profile = buildGameProfile(baseArgs);
    expect(profile.interests).toEqual([
      { name: "Логик", value: 4, description: "Анализ" },
      { name: "Создатель", value: 2, description: "Творчество" },
    ]);
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `npx vitest run src/chat/gameProfile.test.js`
Expected: FAIL — `buildGameProfile` не определён / модуль не найден.

- [ ] **Step 3: Реализовать `buildGameProfile`**

Создать `src/chat/gameProfile.js`:
```js
/**
 * Собирает единый объект профиля игрока для ИИ-консультанта.
 * Чистая функция: всё нужное передаётся аргументами, побочных эффектов нет.
 */
export function buildGameProfile({
  decisions,
  rankedPowers,
  recommendations,
  archetype,
  resultHero,
  comboTrail,
  cards,
  locale,
}) {
  const cardById = new Map(cards.map((card) => [card.id, card]));
  const titleFor = (id) => cardById.get(id)?.title?.[locale] ?? `#${id}`;

  const likedCards = decisions
    .filter((decision) => decision.outcome === "like")
    .map((decision) => titleFor(decision.cardId));

  const skippedCards = decisions
    .filter((decision) => decision.outcome === "skip")
    .map((decision) => titleFor(decision.cardId));

  const interests = rankedPowers.map((power) => ({
    name: power.name,
    value: power.value,
    description: power.description,
  }));

  const maxScore = Math.max(
    0,
    ...recommendations.map((item) => item.specialtyScore),
  );

  const mappedRecommendations = recommendations.map((item) => ({
    title: item.title[locale],
    program: item.program[locale],
    blurb: item.blurb[locale],
    matchPercent:
      maxScore > 0 ? Math.round((item.specialtyScore / maxScore) * 100) : 0,
  }));

  return {
    locale,
    likedCards,
    skippedCards,
    interests,
    archetype: {
      title: archetype.title[locale],
      summary: archetype.summary[locale],
    },
    hero: { title: resultHero.title[locale] },
    recommendations: mappedRecommendations,
    combos: comboTrail.map((combo) => combo.title[locale]),
  };
}
```

- [ ] **Step 4: Запустить тест — убедиться, что проходит**

Run: `npx vitest run src/chat/gameProfile.test.js`
Expected: PASS (5 тестов).

- [ ] **Step 5: Commit**

```bash
git add src/chat/gameProfile.js src/chat/gameProfile.test.js
git commit -m "feat: add buildGameProfile to collect game results for AI chat"
```

---

## Task 3: Serverless-функция `/api/chat`

**Files:**
- Create: `api/chat.js`

Это серверный код для Vercel; локально проверяется через `vercel dev` в Task 7.
Юнит-тестов здесь нет (требует сети/ключа) — корректность проверяется вручную.

- [ ] **Step 1: Создать `api/chat.js`**

Создать файл `api/chat.js`:
```js
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

function formatList(items) {
  if (!items || items.length === 0) {
    return "—";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

function buildSystemPrompt(profile, locale) {
  const interests = (profile.interests ?? [])
    .map((interest) => `- ${interest.name} (${interest.value})`)
    .join("\n");

  const specialties = (profile.recommendations ?? [])
    .map(
      (item, index) =>
        `${index + 1}. ${item.title} — соответствие ${item.matchPercent}% ` +
        `(программа: ${item.program}). ${item.blurb}`,
    )
    .join("\n");

  const languageRule =
    locale === "kz"
      ? "Әрқашан қазақ тілінде жауап бер."
      : "Всегда отвечай на русском языке.";

  return [
    "Ты — тёплый и поддерживающий ИИ-консультант по профориентации.",
    "Ты помогаешь школьнику осознанно выбрать будущую специальность колледжа.",
    "Пользователь только что прошёл профориентационную игру-свайпер.",
    "Ниже — его результаты. Опирайся на них во всех ответах и давай",
    "персональные рекомендации.",
    "",
    `Игровой профиль игрока (титул): ${profile.archetype?.title ?? "—"}`,
    `Описание профиля: ${profile.archetype?.summary ?? "—"}`,
    `Герой: ${profile.hero?.title ?? "—"}`,
    "",
    "Выявленные интересы (суперсилы и их сила):",
    interests || "—",
    "",
    "Понравившиеся ситуации (карточки, которые откликнулись):",
    formatList(profile.likedCards),
    "",
    "Отклонённые ситуации (карточки «не моё»):",
    formatList(profile.skippedCards),
    "",
    "Рекомендованные специальности с процентом соответствия:",
    specialties || "—",
    "",
    "Активированные комбо:",
    formatList(profile.combos),
    "",
    "Что ты умеешь и должен делать:",
    "- отвечать на вопросы о рекомендованных специальностях;",
    "- объяснять, ПОЧЕМУ была рекомендована конкретная специальность,",
    "  связывая её с интересами и понравившимися карточками игрока;",
    "- сравнивать несколько специальностей между собой;",
    "- рассказывать о профессиях, связанных со специальностью;",
    "- описывать карьерные перспективы и востребованность на рынке труда;",
    "- помогать понять сильные стороны и интересы;",
    "- предлагать близкие альтернативные направления;",
    "- поддерживать естественный диалог и учитывать историю переписки.",
    "",
    "Правила:",
    `- ${languageRule}`,
    "- Будь конкретным и опирайся на данные игры, а не на общие фразы.",
    "- Пиши понятно для школьника, дружелюбно, без канцелярита.",
    "- Не выдумывай факты. Если чего-то не знаешь — честно скажи об этом.",
    "- Держи ответы компактными (обычно 2–5 абзацев).",
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
    return;
  }

  const { messages, profile, locale } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0 || !profile) {
    res.status(400).json({ error: "messages and profile are required" });
    return;
  }

  const client = new Anthropic();
  const system = buildSystemPrompt(profile, locale);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages,
    });

    stream.on("text", (delta) => {
      res.write(delta);
    });

    await stream.finalMessage();
    res.end();
  } catch (error) {
    const fallback =
      error?.status === 429
        ? locale === "kz"
          ? "Сұраныстар тым көп. Сәл кідіріп, қайталап көріңіз."
          : "Слишком много запросов. Подождите немного и попробуйте снова."
        : locale === "kz"
          ? "Кеңесші уақытша қолжетімсіз. Кейінірек қайталап көріңіз."
          : "Консультант временно недоступен. Попробуйте позже.";

    if (!res.headersSent) {
      res.status(200);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
    }
    res.write(fallback);
    res.end();
  }
}
```

- [ ] **Step 2: Проверить, что сборка фронтенда не сломана**

Run: `npm run build`
Expected: сборка проходит успешно (функция `/api` не входит в бандл Vite, но
команда подтверждает, что проект в рабочем состоянии).

- [ ] **Step 3: Commit**

```bash
git add api/chat.js
git commit -m "feat: add /api/chat serverless endpoint streaming Claude responses"
```

---

## Task 4: Хук `useChat`

**Files:**
- Create: `src/chat/useChat.js`

- [ ] **Step 1: Создать `src/chat/useChat.js`**

Создать файл `src/chat/useChat.js`:
```js
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
```

- [ ] **Step 2: Проверить сборку**

Run: `npm run build`
Expected: сборка проходит успешно.

- [ ] **Step 3: Commit**

```bash
git add src/chat/useChat.js
git commit -m "feat: add useChat hook for streaming chat history"
```

---

## Task 5: Локализованные строки чата

**Files:**
- Modify: `src/data.js`

- [ ] **Step 1: Добавить строки чата в русскую локаль**

В `src/data.js`, в объекте `localeText.ru`, сразу после строки
`emptyComboTrail: "...",` (перед строкой `pathPills: [`) вставить:
```js
    chatOpen: "Спросить ИИ-консультанта",
    chatTitle: "ИИ-консультант",
    chatSubtitle: "Знаю твои результаты и помогу выбрать специальность",
    chatPlaceholder: "Спроси о специальностях, профессиях, перспективах…",
    chatSend: "Отправить",
    chatClose: "Закрыть",
    chatError: "Что-то пошло не так. Попробуй ещё раз.",
    chatGreeting:
      "Привет! Я изучил твои результаты игры. Спроси меня, почему тебе подходят эти специальности, сравни их или узнай о профессиях и карьере.",
    chatSuggestions: [
      "Почему мне рекомендована первая специальность?",
      "Сравни мои топ-2 специальности",
      "Какие профессии связаны с этими направлениями?",
      "Предложи близкие альтернативы",
    ],
```

- [ ] **Step 2: Добавить строки чата в казахскую локаль**

В `src/data.js`, в объекте `localeText.kz`, сразу после строки
`emptyComboTrail: "...",` (перед строкой `pathPills: [`) вставить:
```js
    chatOpen: "ЖИ-кеңесшіден сұрау",
    chatTitle: "ЖИ-кеңесші",
    chatSubtitle: "Нәтижелеріңді білемін, мамандық таңдауға көмектесемін",
    chatPlaceholder: "Мамандықтар, кәсіптер, болашақ туралы сұра…",
    chatSend: "Жіберу",
    chatClose: "Жабу",
    chatError: "Бірдеңе дұрыс болмады. Қайталап көр.",
    chatGreeting:
      "Сәлем! Ойын нәтижелеріңді қарап шықтым. Бұл мамандықтар саған неге сай екенін сұра, оларды салыстыр немесе кәсіптер мен мансап туралы біл.",
    chatSuggestions: [
      "Бірінші мамандық маған неге ұсынылды?",
      "Топ-2 мамандығымды салыстыр",
      "Бұл бағыттармен қандай кәсіптер байланысты?",
      "Жақын баламаларды ұсын",
    ],
```

- [ ] **Step 3: Проверить сборку**

Run: `npm run build`
Expected: сборка проходит успешно (нет синтаксических ошибок в `data.js`).

- [ ] **Step 4: Commit**

```bash
git add src/data.js
git commit -m "feat: add localized chat UI strings (RU/KZ)"
```

---

## Task 6: Компонент `ChatDrawer` и стили

**Files:**
- Create: `src/components/ChatDrawer.jsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Создать `src/components/ChatDrawer.jsx`**

Создать файл `src/components/ChatDrawer.jsx`:
```jsx
import { useEffect, useRef, useState } from "react";
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="chat-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
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
        </>
      )}
    </AnimatePresence>
  );
}

export default ChatDrawer;
```

- [ ] **Step 2: Добавить стили чата в `src/styles.css`**

Добавить в конец `src/styles.css`:
```css
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 6, 16, 0.55);
  backdrop-filter: blur(2px);
  z-index: 40;
}

.chat-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(440px, 92vw);
  background: #0d1020;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 50;
  box-shadow: -24px 0 60px rgba(0, 0, 0, 0.45);
}

.chat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-header strong {
  display: block;
  font-size: 17px;
  color: #fff;
}

.chat-header span {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.chat-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-bubble {
  max-width: 88%;
  padding: 12px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.chat-bubble.assistant {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.92);
  border-bottom-left-radius: 4px;
}

.chat-bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-bubble.error {
  align-self: stretch;
  background: rgba(248, 113, 113, 0.16);
  color: #fecaca;
  text-align: center;
}

.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 20px 14px;
}

.chat-suggestions button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.chat-suggestions button:hover {
  background: rgba(255, 255, 255, 0.12);
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.chat-input input {
  flex: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 11px 14px;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.chat-input input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.chat-input button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  padding: 0 18px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Проверить сборку**

Run: `npm run build`
Expected: сборка проходит успешно.

- [ ] **Step 4: Commit**

```bash
git add src/components/ChatDrawer.jsx src/styles.css
git commit -m "feat: add ChatDrawer UI component and styles"
```

---

## Task 7: Интеграция в `App.jsx`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Добавить импорты**

В `src/App.jsx`, после строки
`import ShimmerButton from "./components/ShimmerButton";` добавить:
```jsx
import ChatDrawer from "./components/ChatDrawer";
import { buildGameProfile } from "./chat/gameProfile";
```

- [ ] **Step 2: Добавить состояние `decisions` и `chatOpen`**

В `src/App.jsx`, сразу после строки
`const [cardOrder, setCardOrder] = useState(cards);` добавить:
```jsx
  const [decisions, setDecisions] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
```

- [ ] **Step 3: Собрать профиль через `useMemo`**

В `src/App.jsx`, сразу после блока `const resultHero = useMemo(...)` (заканчивается
на `}, [archetype]);`) добавить:
```jsx
  const gameProfile = useMemo(
    () =>
      buildGameProfile({
        decisions,
        rankedPowers,
        recommendations,
        archetype,
        resultHero,
        comboTrail,
        cards,
        locale,
      }),
    [decisions, rankedPowers, recommendations, archetype, resultHero, comboTrail, locale],
  );
```

- [ ] **Step 4: Сбрасывать состояние чата при старте игры**

В `src/App.jsx`, в функции `beginGame`, после строки
`setComboTrail([]);` добавить:
```jsx
    setDecisions([]);
    setChatOpen(false);
```

- [ ] **Step 5: Записывать решения в `applyOutcome`**

В `src/App.jsx`, в функции `applyOutcome`, сразу после строки
`setLastSwipe(outcome);` добавить:
```jsx
    setDecisions((previous) => [...previous, { cardId: card.id, outcome }]);
```

- [ ] **Step 6: Добавить кнопку-триггер и рендер drawer**

В `src/App.jsx`, внутри блока `result-actions`, после кнопки «Пройти заново»
(`<button type="button" className="ghost-button" onClick={beginGame}>{text.restart}</button>`)
добавить новую кнопку:
```jsx
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setChatOpen(true)}
                  >
                    {text.chatOpen}
                  </button>
```

Затем сразу после закрывающего тега `</div>` блока `result-actions` (но всё ещё
внутри `motion.div` с `key="results"`) добавить рендер drawer:
```jsx
                <ChatDrawer
                  open={chatOpen}
                  onClose={() => setChatOpen(false)}
                  profile={gameProfile}
                  locale={locale}
                  text={text}
                />
```

- [ ] **Step 7: Запустить весь набор тестов**

Run: `npx vitest run`
Expected: PASS (тесты `buildGameProfile` проходят).

- [ ] **Step 8: Проверить сборку**

Run: `npm run build`
Expected: сборка проходит успешно.

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx
git commit -m "feat: track swipe decisions and wire up AI chat drawer on results"
```

---

## Task 8: Локальная проверка через `vercel dev`

**Files:** нет (ручная проверка).

- [ ] **Step 1: Установить Vercel CLI (если не установлен)**

Run: `npx vercel --version`
Expected: печатает версию. Если CLI отсутствует, `npx` предложит его установить —
согласиться.

- [ ] **Step 2: Создать локальный `.env` с ключом API**

Создать файл `.env` (НЕ коммитить — он в `.gitignore`) с содержимым:
```
ANTHROPIC_API_KEY=sk-ant-...ваш-ключ...
```
(Ключ берётся из https://console.anthropic.com/. Этот шаг выполняет пользователь.)

- [ ] **Step 3: Запустить локальный сервер с функциями**

Run: `npx vercel dev`
Expected: сервер поднимается (обычно на http://localhost:3000). При первом запуске
CLI задаст вопросы о линковке проекта — пройти их (можно создать новый проект).

- [ ] **Step 4: Проверить сценарий вручную**

В браузере открыть локальный URL, пройти игру до экрана результатов, нажать
кнопку «Спросить ИИ-консультанта», задать вопрос (например, нажать чип «Почему мне
рекомендована первая специальность?»).
Expected:
- drawer выезжает справа;
- ответ ассистента появляется потоково (по мере генерации);
- ответ ссылается на реальные специальности/интересы игрока;
- переключение языка RU/KZ до игры → ответы на соответствующем языке.

- [ ] **Step 5: Проверить, что `.env` не попал в git**

Run: `git status`
Expected: `.env` НЕ значится среди отслеживаемых/новых файлов (он игнорируется).

---

## Task 9: Деплой на Vercel

**Files:** нет (операция деплоя).

- [ ] **Step 1: Залогиниться в Vercel**

Run: `npx vercel login`
Expected: успешная авторизация (по email/GitHub).

- [ ] **Step 2: Линковать проект**

Run: `npx vercel link`
Expected: проект привязан к аккаунту Vercel (создан новый или выбран существующий).

- [ ] **Step 3: Задать переменную окружения в проекте Vercel**

Run:
```bash
npx vercel env add ANTHROPIC_API_KEY production
npx vercel env add ANTHROPIC_API_KEY preview
```
При запросе значения вставить ключ Anthropic API.
Expected: переменная добавлена для Production и Preview.

- [ ] **Step 4: Preview-деплой и проверка**

Run: `npx vercel`
Expected: создаётся preview-URL. Открыть его, повторить ручной сценарий из
Task 8 Step 4 — чат работает на задеплоенном окружении.

- [ ] **Step 5: Production-деплой**

Run: `npx vercel --prod`
Expected: создаётся production-URL. Открыть его и убедиться, что чат-консультант
работает на боевом окружении.

- [ ] **Step 6: Финальный коммит при необходимости**

Если деплой создал/изменил конфигурационные файлы (например, `.vercel/`
добавляется в `.gitignore` автоматически):
```bash
git status
git add .gitignore
git commit -m "chore: ignore .vercel local config"
```
(Каталог `.vercel/` не коммитить — это локальная линковка.)

---

## Самопроверка плана (для автора)

- **Покрытие спецификации:**
  - Сбор контекста (like/skip, интересы, архетип, топ-3 со %, комбо) → Task 2.
  - Endpoint с system-prompt и стримингом → Task 3.
  - Хук истории/стрима → Task 4.
  - Локализация RU/KZ → Task 5 (+ строки используются в Task 6/7).
  - Drawer-UI на экране результатов → Task 6 + Task 7.
  - Отслеживание решений в игре → Task 7.
  - Зависимости/секреты/тест-раннер → Task 1.
  - Тесты `buildGameProfile` → Task 2.
  - Локальная проверка (`vercel dev`) → Task 8.
  - Деплой на Vercel → Task 9.
- **Согласованность типов:** `buildGameProfile` возвращает `{ locale, likedCards,
  skippedCards, interests, archetype{title,summary}, hero{title}, recommendations[
  {title,program,blurb,matchPercent}], combos }` — ровно эти поля читает
  `buildSystemPrompt` в `api/chat.js` (Task 3). UI-строки (`chatOpen`, `chatTitle`,
  `chatSubtitle`, `chatPlaceholder`, `chatSend`, `chatClose`, `chatError`,
  `chatGreeting`, `chatSuggestions`) заданы в Task 5 и используются в Task 6/7.
  Хук `useChat` экспортирует `{ messages, isStreaming, error, sendMessage }` —
  именно это потребляет `ChatDrawer`.
- **Плейсхолдеры:** отсутствуют — весь код приведён целиком.
```
