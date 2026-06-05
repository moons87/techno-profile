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
