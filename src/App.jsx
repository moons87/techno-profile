import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  cards,
  collegeLinks,
  heroCharacters,
  localeText,
  profileArchetypes,
  specialties,
} from "./data";

const initialScores = {
  logic: 0,
  practice: 0,
  research: 0,
  organize: 0,
  create: 0,
  connect: 0,
};

const powerAccent = {
  logic: "logic",
  practice: "practice",
  research: "research",
  organize: "organize",
  create: "create",
  connect: "connect",
};

const accentClasses = {
  aurora: "card-aurora",
  pulse: "card-pulse",
  signal: "card-signal",
  ember: "card-ember",
  neon: "card-neon",
  horizon: "card-horizon",
};

function App() {
  const [locale, setLocale] = useState("ru");
  const [stage, setStage] = useState("welcome");
  const [selectedHeroId, setSelectedHeroId] = useState(heroCharacters[0].id);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState(initialScores);
  const [lastSwipe, setLastSwipe] = useState(null);
  const [burst, setBurst] = useState(0);
  const [gainMoments, setGainMoments] = useState([]);
  const [comboMoment, setComboMoment] = useState(null);
  const [comboTrail, setComboTrail] = useState([]);

  const text = localeText[locale];
  const currentCard = cards[index];
  const selectedHero =
    heroCharacters.find((character) => character.id === selectedHeroId) ?? heroCharacters[0];

  const rankedPowers = useMemo(() => {
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        key,
        value,
        name: text.powerNames[key],
        description: text.powerDescriptions[key],
        profile: text.profileCopy[key],
      }));
  }, [scores, text]);

  const recommendations = useMemo(() => {
    return specialties
      .map((specialty) => {
        const specialtyScore = Object.entries(specialty.powers).reduce(
          (sum, [power, weight]) => sum + weight * scores[power],
          0,
        );

        return {
          ...specialty,
          specialtyScore,
        };
      })
      .sort((a, b) => b.specialtyScore - a.specialtyScore)
      .slice(0, 3);
  }, [scores]);

  const archetype = useMemo(() => {
    const topKeys = rankedPowers.slice(0, 2).map((item) => item.key);
    return (
      profileArchetypes.find((item) =>
        item.match.every((power) => topKeys.includes(power)),
      ) ?? profileArchetypes[profileArchetypes.length - 1]
    );
  }, [rankedPowers]);

  const resultHero = useMemo(() => {
    return (
      heroCharacters.find((character) => character.id === archetype.heroId) ??
      heroCharacters[0]
    );
  }, [archetype]);

  const selectedHeroRecommendations = useMemo(() => {
    return specialties
      .map((specialty) => {
        const specialtyScore = selectedHero.powers.reduce(
          (sum, power, powerIndex) =>
            sum + (specialty.powers[power] ?? 0) * (selectedHero.powers.length - powerIndex + 1),
          0,
        );

        return {
          ...specialty,
          specialtyScore,
        };
      })
      .sort((a, b) => b.specialtyScore - a.specialtyScore)
      .slice(0, 3);
  }, [selectedHero]);

  const strongestPair = rankedPowers.slice(0, 2).map((item) => item.name).join(" + ");
  const highlightedPowers = new Set(gainMoments.map((item) => item.power));
  const currentComboReady =
    currentCard?.combo &&
    currentCard.combo.requires.every((power) => scores[power] >= 1);

  useEffect(() => {
    if (!gainMoments.length) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setGainMoments([]), 920);
    return () => window.clearTimeout(timeout);
  }, [gainMoments]);

  useEffect(() => {
    if (!comboMoment) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setComboMoment(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [comboMoment]);

  useEffect(() => {
    if (stage === "results") {
      setBurst((value) => value + 1);
    }
  }, [stage]);

  const beginGame = () => {
    setScores(initialScores);
    setIndex(0);
    setLastSwipe(null);
    setGainMoments([]);
    setComboMoment(null);
    setComboTrail([]);
    setStage("play");
  };

  const applyOutcome = (outcome) => {
    const card = cards[index];
    const delta = { ...card[outcome] };
    const comboTriggered =
      outcome === "like" &&
      card.combo &&
      card.combo.requires.every((power) => scores[power] >= 1);

    if (comboTriggered) {
      Object.entries(card.combo.bonus).forEach(([power, amount]) => {
        delta[power] = (delta[power] ?? 0) + amount;
      });
    }

    setScores((previous) => {
      const next = { ...previous };
      Object.entries(delta).forEach(([power, amount]) => {
        next[power] += amount;
      });
      return next;
    });

    setGainMoments(
      Object.entries(delta).map(([power, amount], gainIndex) => ({
        id: `${card.id}-${power}-${gainIndex}-${Date.now()}`,
        power,
        amount,
        bonus: Boolean(comboTriggered && card.combo?.bonus[power]),
      })),
    );

    if (comboTriggered) {
      const payload = {
        id: `${card.id}-${Date.now()}`,
        title: card.combo.title,
        requires: card.combo.requires,
      };

      setComboMoment(payload);
      setComboTrail((previous) => [...previous, payload]);
    }

    setLastSwipe(outcome);

    const delay = comboTriggered ? 1180 : 760;

    if (index === cards.length - 1) {
      window.setTimeout(() => setStage("results"), delay);
      return;
    }

    window.setTimeout(() => {
      setIndex((value) => value + 1);
      setLastSwipe(null);
    }, delay);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="noise" />

      <header className="topbar">
        <div>
          <div className="eyebrow">Career Swipe Experience</div>
          <h1>{text.appTitle}</h1>
        </div>

        <div className="lang-switch" role="tablist" aria-label="Language switcher">
          <button
            type="button"
            className={locale === "ru" ? "active" : ""}
            onClick={() => setLocale("ru")}
          >
            RU
          </button>
          <button
            type="button"
            className={locale === "kz" ? "active" : ""}
            onClick={() => setLocale("kz")}
          >
            KZ
          </button>
        </div>
      </header>

      <main className="main-grid">
        <section className="hero-panel">
          <p className="hero-kicker">{text.appTagline}</p>
          <AnimatePresence mode="wait">
            {stage === "welcome" && (
              <motion.div
                key="welcome"
                className="welcome-stack"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                >
                  <div className="welcome-grid">
                    <div className="welcome-copy">
                      <div className="welcome-badge-row">
                        <span className="welcome-badge">{text.welcomeBadge}</span>
                      </div>
                      <h2>{text.welcomeTitle}</h2>
                      <p>{text.welcomeLead}</p>
                      <p className="welcome-micro">{text.welcomeMicro}</p>
                      <div className="mission-stats">
                        {text.missionStats.map((stat) => (
                          <article key={`${stat.value}-${stat.label}`} className="mission-stat-card">
                            <strong>{stat.value}</strong>
                            <span>{stat.label}</span>
                          </article>
                        ))}
                      </div>
                      <div className="pill-row">
                        {text.pathPills.map((path) => (
                          <span key={path}>{path}</span>
                        ))}
                      </div>
                      <div className="welcome-actions">
                        <button type="button" className="primary-button" onClick={beginGame}>
                          {text.start}
                        </button>
                      </div>
                    </div>

                    <div className="hero-stage">
                      <motion.div
                        className="featured-character"
                      initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="featured-character-halo" />
                        <img
                          src={selectedHero.image}
                          alt={selectedHero.title[locale]}
                          className="featured-character-image"
                        />
                      <div className="featured-character-copy">
                        <span>{text.crewSpotlight}</span>
                        <strong>{selectedHero.title[locale]}</strong>
                        <p>{selectedHero.subtitle[locale]}</p>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <section className="landing-section">
                  <div className="section-head">
                    <div>
                      <div className="section-title">{text.crewTitle}</div>
                      <p className="character-lead">{text.crewLead}</p>
                    </div>
                    <button type="button" className="ghost-button" onClick={beginGame}>
                      {text.start}
                    </button>
                  </div>

                  <div className="hero-crew full-crew">
                    {heroCharacters.map((character, characterIndex) => (
                      <HeroCharacter
                        key={character.id}
                        character={character}
                        locale={locale}
                        delay={characterIndex * 0.08}
                        selected={selectedHeroId === character.id}
                        onSelect={() => setSelectedHeroId(character.id)}
                      />
                    ))}
                  </div>

                  <div className="hero-focus-panel">
                    <div className="hero-focus-copy">
                      <div className="section-title">{text.heroFocusTitle}</div>
                      <strong>{selectedHero.title[locale]}</strong>
                      <p>{text.heroFocusLead}</p>
                    </div>

                    <div className="hero-focus-section">
                      <span className="hero-focus-label">{text.heroFocusPowers}</span>
                      <div className="hero-focus-pills">
                        {selectedHero.powers.map((power) => (
                          <span key={`${selectedHero.id}-${power}`} className={`hero-focus-pill ${powerAccent[power]}`}>
                            {text.powerNames[power]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hero-focus-section">
                      <span className="hero-focus-label">{text.heroFocusPaths}</span>
                      <div className="hero-focus-specialties">
                        {selectedHeroRecommendations.map((specialty) => (
                          <article key={`${selectedHero.id}-${specialty.id}`} className="hero-focus-specialty">
                            <span>{specialty.program[locale]}</span>
                            <strong>{specialty.title[locale]}</strong>
                          </article>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="landing-section">
                  <div className="section-head">
                    <div>
                      <div className="section-title">{text.cardsPreviewTitle}</div>
                      <p className="character-lead">{text.cardsPreviewLead}</p>
                    </div>
                  </div>

                  <div className="preview-cards-grid">
                    {cards.slice(0, 4).map((card) => (
                      <article
                        key={`preview-${card.id}`}
                        className={`preview-card ${accentClasses[card.accent]}`}
                      >
                        <div className="preview-card-topline">
                          <span>Signal 0{card.id}</span>
                          {card.combo ? <span>{card.combo.title[locale]}</span> : null}
                        </div>
                        <h3>{card.title[locale]}</h3>
                        <p>{card.body[locale]}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {stage === "play" && currentCard && (
              <motion.div
                key={`play-${currentCard.id}`}
                className="play-stack"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <div className="status-row">
                  <span>
                    {text.progress} {index + 1} {text.of} {cards.length}
                  </span>
                  <span
                    className={`status-badge ${
                      lastSwipe === "like" ? "right" : lastSwipe === "skip" ? "left" : ""
                    }`}
                  >
                    {lastSwipe === "like"
                      ? text.swipeRight
                      : lastSwipe === "skip"
                        ? text.swipeLeft
                        : text.swipeIdle}
                  </span>
                </div>

                <div className="progress-bar">
                  <motion.div
                    className="progress-value"
                    initial={{ width: 0 }}
                    animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
                  />
                </div>

                <AnimatePresence>
                  {currentCard.combo && (
                    <motion.div
                      key={`${currentCard.id}-combo`}
                      className={`combo-callout ${currentComboReady ? "ready" : "locked"}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                    >
                      <div>
                        <span className="combo-chip">
                          {currentComboReady ? text.comboReady : text.comboLocked}
                        </span>
                        <strong>{currentCard.combo.title[locale]}</strong>
                      </div>
                      <div className="combo-requirements">
                        {currentCard.combo.requires.map((power) => (
                          <span key={power}>{text.powerNames[power]}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {gainMoments.length > 0 && (
                    <motion.div
                      className="gain-row"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                    >
                      {gainMoments.map((gain) => (
                        <motion.span
                          key={gain.id}
                          className={`gain-pill ${powerAccent[gain.power]} ${
                            gain.bonus ? "bonus" : ""
                          }`}
                          initial={{ opacity: 0, y: 18, scale: 0.92 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -12, scale: 0.96 }}
                        >
                          {text.powerNames[gain.power]} +{gain.amount}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {comboMoment && (
                    <motion.div
                      className="combo-banner"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <span>{text.comboActivated}</span>
                      <strong>{comboMoment.title[locale]}</strong>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="card-stage">
                  <SwipeCard
                    card={currentCard}
                    locale={locale}
                    comboReady={currentComboReady}
                    onAnswer={applyOutcome}
                  />
                </div>

                <div className="action-row">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => applyOutcome("skip")}
                  >
                    {text.swipeLeft}
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => applyOutcome("like")}
                  >
                    {text.swipeRight}
                  </button>
                </div>
              </motion.div>
            )}

            {stage === "results" && (
              <motion.div
                key="results"
                className="result-stack"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <Confetti burst={burst} />

                <div className="result-spotlight">
                  <div className="spotlight-orb" />
                  <div className="result-hero-layout">
                    <div className="result-header">
                      <span className="result-label">{text.finalLabel}</span>
                      <h2>{archetype.title[locale]}</h2>
                      <p>{archetype.summary[locale]}</p>
                    </div>

                    <div className={`result-hero-card ${resultHero.accent}`}>
                      <div className="result-hero-copy">
                        <span>{text.heroResultLabel}</span>
                        <strong>{resultHero.title[locale]}</strong>
                        <p>{text.heroResultLead}</p>
                      </div>
                      <div className="result-hero-image-frame">
                        <img
                          src={resultHero.image}
                          alt={resultHero.title[locale]}
                          className="result-hero-image"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="spotlight-stats">
                    <div className="spotlight-chip">
                      <span>{text.profileTitleLabel}</span>
                      <strong>{archetype.title[locale]}</strong>
                    </div>
                    <div className="spotlight-chip">
                      <span>{text.comboCountLabel}</span>
                      <strong>{comboTrail.length}</strong>
                    </div>
                    <div className="spotlight-chip">
                      <span>{text.synergyLabel}</span>
                      <strong>{strongestPair}</strong>
                    </div>
                  </div>
                </div>

                <div className="result-text">
                  <p>{text.resultLead}</p>
                </div>

                <div className="powers-grid">
                  {rankedPowers.slice(0, 3).map((power) => (
                    <article key={power.key} className="power-card">
                      <div className="power-meter">
                        <motion.div
                          className={`power-fill ${powerAccent[power.key]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(18, power.value * 10)}%` }}
                        />
                      </div>
                      <h3>{power.name}</h3>
                      <p>{power.profile}</p>
                    </article>
                  ))}
                </div>

                <div className="result-list">
                  <div className="section-title">{text.recommendationsTitle}</div>
                  {recommendations.map((specialty, specialtyIndex) => (
                    <article key={specialty.id} className="specialty-card">
                      <div className="specialty-rank">0{specialtyIndex + 1}</div>
                      <div className="specialty-copy">
                        <span>{specialty.program[locale]}</span>
                        <h3>{specialty.title[locale]}</h3>
                        <p>{specialty.blurb[locale]}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="result-actions">
                  {collegeLinks[locale] ? (
                    <a
                      className="primary-button"
                      href={collegeLinks[locale]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {text.details}
                    </a>
                  ) : (
                    <span className="ghost-button is-disabled">{text.detailsMissing}</span>
                  )}
                  <button type="button" className="ghost-button" onClick={beginGame}>
                    {text.restart}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside className="info-panel">
          <div className="panel-section">
            <div className="section-title">{text.powersTitle}</div>
            <div className="mini-power-list">
              {rankedPowers.map((power) => (
                <div
                  key={power.key}
                  className={`mini-power-item ${
                    highlightedPowers.has(power.key) ? "is-highlighted" : ""
                  }`}
                >
                  <div className="mini-power-head">
                    <span>{power.name}</span>
                    <span>{power.value}</span>
                  </div>
                  <div className="mini-power-bar">
                    <motion.div
                      className={`mini-power-fill ${powerAccent[power.key]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, power.value * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">{text.comboTrailTitle}</div>
            {comboTrail.length ? (
              <div className="combo-trail">
                {comboTrail.slice(-3).reverse().map((combo) => (
                  <div key={combo.id} className="combo-trail-card">
                    <strong>{combo.title[locale]}</strong>
                    <span>
                      {combo.requires
                        .map((power) => text.powerNames[power])
                        .join(" + ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">{text.emptyComboTrail}</p>
            )}
          </div>

          <div className="panel-section">
            <div className="section-title">{text.pathsTitle}</div>
            <div className="path-list">
              {text.pathPills.map((path) => (
                <span key={path}>{path}</span>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function HeroCharacter({ character, delay, locale, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      className={`hero-character ${character.accent} ${selected ? "is-selected" : ""}`}
      onClick={onSelect}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <motion.div
        className="character-image-frame"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay * 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={character.image}
          alt={character.title[locale]}
          className="character-image"
        />
      </motion.div>
      <div className="hero-character-copy">
        <strong>{character.title[locale]}</strong>
        <span>{character.subtitle[locale]}</span>
      </div>
    </motion.button>
  );
}

function SwipeCard({ card, locale, comboReady, onAnswer }) {
  return (
    <motion.article
      className={`swipe-card ${accentClasses[card.accent]}`}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) {
          onAnswer("like");
        } else if (info.offset.x < -120) {
          onAnswer("skip");
        }
      }}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      whileDrag={{ rotate: 8, scale: 1.02 }}
    >
      <div className="card-glow" />
      <div className="card-topline">
        <span>Superpower Signal</span>
        <span>0{card.id}</span>
      </div>

      {card.combo ? (
        <div className={`card-combo-pill ${comboReady ? "ready" : ""}`}>
          <span>{localeText[locale].comboActivated}</span>
          <strong>{card.combo.title[locale]}</strong>
        </div>
      ) : null}

      <h3>{card.title[locale]}</h3>
      <p>{card.body[locale]}</p>

      <div className="card-footer">
        <span>← {localeText[locale].swipeLeft}</span>
        <span>{localeText[locale].swipeRight} →</span>
      </div>
    </motion.article>
  );
}

function Confetti({ burst }) {
  const pieces = Array.from({ length: 18 }, (_, index) => ({
    id: `${burst}-${index}`,
    left: `${(index * 13) % 100}%`,
    delay: `${(index % 6) * 0.08}s`,
    duration: `${1.8 + (index % 4) * 0.22}s`,
  }));

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}

export default App;
