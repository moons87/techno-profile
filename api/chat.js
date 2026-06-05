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
