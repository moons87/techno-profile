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
