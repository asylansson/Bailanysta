// Free, local (no API) hashtag suggestion: scans the post text for keywords
// tied to a mood/tone or a topic, and returns matching hashtags in the post's
// own language. Pure keyword lookup - no network call, no cost.

const MOOD_KEYWORDS = {
  happy: {
    ru: [
      "рад", "радост", "счастлив", "отлично", "прекрасно", "супер", "класс", "ура", "восторг",
      "кайф", "красота", "обожаю", "любимый день", "повезло", "улыбаюсь", "воодушевлен",
    ],
    kk: ["қуан", "бақыт", "керемет", "тамаша", "ура", "жақсы көремін", "көңілім көтерінкі"],
    en: [
      "happy", "great", "awesome", "amazing", "joy", "yay", "wonderful", "love it", "delighted",
      "thrilled", "lucky", "smiling", "best day",
    ],
  },
  angry: {
    ru: [
      "зол", "злюсь", "бесит", "бесят", "раздраж", "ненавиж", "достал", "достало", "взбесил",
      "выводит из себя", "в ярости", "ужасно себя веду", "разозлил",
    ],
    kk: ["ашулан", "ашуым келді", "жиренд", "тітіркен", "әбден жиренд"],
    en: [
      "angry", "furious", "annoyed", "annoying", "hate it", "pissed off", "irritat", "mad at",
      "fed up", "sick of",
    ],
  },
  tired: {
    ru: ["устал", "устала", "утомл", "выдохся", "измотан", "без сил", "вымотан", "истощен"],
    kk: ["шаршад", "қалжыра", "әлім жоқ"],
    en: ["tired", "exhausted", "worn out", "sleepy", "drained", "burnt out", "no energy"],
  },
  sad: {
    ru: [
      "груст", "печал", "одинок", "плохо", "тяжело на душе", "тоск", "расстро", "уныл", "слезы",
      "разбит",
    ],
    kk: ["көңілсіз", "жалғыз", "қиын", "қайғы", "жылады"],
    en: ["sad", "lonely", "down", "upset", "heartbroken", "miserable", "crying", "depressed"],
  },
  motivation: {
    ru: [
      "продуктив", "цель", "достиж", "победа", "горжусь", "получилось", "смог", "справился",
      "мотивац", "не сдамся", "верю в себя",
    ],
    kk: ["мақсат", "жеңіс", "мақтанамын", "қолдан келді", "сенемін"],
    en: [
      "productive", "goal", "achieve", "proud", "win", "did it", "motivat", "made it",
      "believe in myself",
    ],
  },
  grateful: {
    ru: ["благодар", "спасибо", "признателен", "ценю", "спасибо всем"],
    kk: ["рахмет", "алғыс", "ризамын"],
    en: ["grateful", "thankful", "thanks", "appreciate", "blessed"],
  },
  relax: {
    ru: ["отдых", "спокойств", "тишина", "расслаб", "выходн", "лень", "ничегонеделание"],
    kk: ["демал", "тыныштық", "жалқаулық"],
    en: ["relax", "calm", "quiet", "chill", "weekend", "lazy day", "doing nothing"],
  },
  humor: {
    ru: ["смешно", "юмор", "ржу", "прикол", "рассмешил", "угар", "ору", "смеюсь"],
    kk: ["әзіл", "күлкі", "күлдім"],
    en: ["funny", "hilarious", "lol", "joke", "lmao", "cracked me up"],
  },
};

// Question marks are an unambiguous grammatical signal (unlike "!", which
// could mean joy, anger, or plain emphasis) - safe to use on their own.
const QUESTION_LABEL = { ru: "Вопрос", kk: "Сұрақ", en: "Question" };

const TOPIC_KEYWORDS = {
  technology: {
    ru: ["код", "программ", "технолог", "ноутбук", "компьютер", "сайт", "приложен"],
    kk: ["код", "технолог", "компьютер"],
    en: ["code", "tech", "laptop", "software", "app", "programming"],
  },
  sports: {
    ru: ["спорт", "бег", "трениров", "футбол", "баскетбол", "зал", "фитнес"],
    kk: ["спорт", "жаттығу", "футбол"],
    en: ["sport", "run", "workout", "gym", "football", "training"],
  },
  music: {
    ru: ["музык", "концерт", "песня", "гитара", "плейлист", "трек"],
    kk: ["музыка", "ән", "концерт"],
    en: ["music", "concert", "song", "guitar", "playlist"],
  },
  movies: {
    ru: ["фильм", "кино", "сериал"],
    kk: ["фильм", "кино", "сериал"],
    en: ["movie", "film", "cinema", "series"],
  },
  travel: {
    ru: ["путешеств", "поездк", "отпуск", "горы", "аэропорт", "билет"],
    kk: ["саяхат", "демалыс", "тау"],
    en: ["travel", "trip", "vacation", "mountains", "flight"],
  },
  food: {
    ru: ["еда", "готов", "рецепт", "кофе", "ресторан", "ужин", "завтрак"],
    kk: ["тамақ", "дәм", "кофе"],
    en: ["food", "cook", "recipe", "coffee", "restaurant", "dinner"],
  },
  gaming: {
    ru: ["игра", "игру", "геймер", "приставк"],
    kk: ["ойын", "геймер"],
    en: ["game", "gaming", "gamer", "console"],
  },
  science: {
    ru: ["наука", "физик", "космос", "исследован"],
    kk: ["ғылым", "физика", "ғарыш"],
    en: ["science", "physics", "space", "research"],
  },
  art: {
    ru: ["искусств", "рисова", "выставк", "картин"],
    kk: ["өнер", "сурет", "көрме"],
    en: ["art", "draw", "painting", "exhibition"],
  },
  books: {
    ru: ["книга", "книгу", "читать", "библиотек", "автор"],
    kk: ["кітап", "оқу", "кітапхана"],
    en: ["book", "read", "library", "novel"],
  },
  fashion: {
    ru: ["мода", "стиль", "одежд", "гардероб"],
    kk: ["сән", "стиль", "киім"],
    en: ["fashion", "style", "outfit", "wardrobe"],
  },
  health: {
    ru: ["здоровь", "сон", "медитац", "самочувств"],
    kk: ["денсаулық", "ұйқы"],
    en: ["health", "sleep", "meditation", "wellbeing"],
  },
  business: {
    ru: ["бизнес", "стартап", "проект", "сделк", "команда"],
    kk: ["бизнес", "жоба", "команда"],
    en: ["business", "startup", "project", "deal", "team"],
  },
  education: {
    ru: ["учеба", "курс", "экзамен", "универ", "учусь"],
    kk: ["оқу", "курс", "емтихан"],
    en: ["study", "course", "exam", "university", "learning"],
  },
  nature: {
    ru: ["природ", "лес", "закат", "прогулк", "поход"],
    kk: ["табиғат", "орман", "серуен"],
    en: ["nature", "forest", "sunset", "walk", "hike"],
  },
  photography: {
    ru: ["фото", "камер", "объектив", "снимок"],
    kk: ["фото", "камера"],
    en: ["photo", "camera", "lens", "shot"],
  },
  cars: {
    ru: ["машин", "авто", "автомобил", "парковк"],
    kk: ["көлік", "машина"],
    en: ["car", "auto", "vehicle", "driving"],
  },
  finance: {
    ru: ["деньги", "бюджет", "инвестиц", "финанс"],
    kk: ["ақша", "бюджет", "қаржы"],
    en: ["money", "budget", "invest", "finance"],
  },
  history: {
    ru: ["истори", "музей", "прошл"],
    kk: ["тарих", "мұражай"],
    en: ["history", "museum", "past"],
  },
};

const LABELS = {
  happy: { ru: "Рад", kk: "Қуаныш", en: "Happy" },
  angry: { ru: "Злость", kk: "Ашу", en: "Angry" },
  tired: { ru: "Устал", kk: "Шаршадым", en: "Tired" },
  sad: { ru: "Грустно", kk: "Көңілсіз", en: "Sad" },
  motivation: { ru: "Мотивация", kk: "Мотивация", en: "Motivation" },
  grateful: { ru: "Благодарность", kk: "Алғыс", en: "Grateful" },
  relax: { ru: "Отдых", kk: "Демалыс", en: "Relax" },
  humor: { ru: "Юмор", kk: "Әзіл", en: "Humor" },
  technology: { ru: "Технологии", kk: "Технология", en: "Technology" },
  sports: { ru: "Спорт", kk: "Спорт", en: "Sports" },
  music: { ru: "Музыка", kk: "Музыка", en: "Music" },
  movies: { ru: "Кино", kk: "Кино", en: "Movies" },
  travel: { ru: "Путешествия", kk: "Саяхат", en: "Travel" },
  food: { ru: "Еда", kk: "Тағам", en: "Food" },
  gaming: { ru: "Игры", kk: "Ойындар", en: "Gaming" },
  science: { ru: "Наука", kk: "Ғылым", en: "Science" },
  art: { ru: "Искусство", kk: "Өнер", en: "Art" },
  books: { ru: "Книги", kk: "Кітаптар", en: "Books" },
  fashion: { ru: "Мода", kk: "Сән", en: "Fashion" },
  health: { ru: "Здоровье", kk: "Денсаулық", en: "Health" },
  business: { ru: "Бизнес", kk: "Бизнес", en: "Business" },
  education: { ru: "Учеба", kk: "Білім", en: "Education" },
  nature: { ru: "Природа", kk: "Табиғат", en: "Nature" },
  photography: { ru: "Фото", kk: "Фото", en: "Photography" },
  cars: { ru: "Авто", kk: "Көлік", en: "Cars" },
  finance: { ru: "Финансы", kk: "Қаржы", en: "Finance" },
  history: { ru: "История", kk: "Тарих", en: "History" },
};

const KEYWORD_GROUPS = { ...MOOD_KEYWORDS, ...TOPIC_KEYWORDS };

export function suggestHashtags(text, language = "ru", maxTags = 5) {
  const raw = text || "";
  const needle = raw.toLowerCase();
  if (!needle.trim()) return [];

  const matches = [];
  for (const [tag, byLanguage] of Object.entries(KEYWORD_GROUPS)) {
    const keywords = byLanguage[language] || byLanguage.ru || [];
    if (keywords.some((word) => needle.includes(word))) {
      const label = LABELS[tag]?.[language] || LABELS[tag]?.ru || tag;
      matches.push(`#${label}`);
    }
  }

  // A "?" reliably marks a question regardless of tone, so it's safe to use
  // on its own. A bare "!" is deliberately NOT used as a mood signal - it's
  // just as likely to mean anger as joy, and the keyword lists above already
  // catch both moods from the actual words used.
  if (raw.includes("?")) {
    const label = QUESTION_LABEL[language] || QUESTION_LABEL.ru;
    matches.push(`#${label}`);
  }

  return matches.slice(0, maxTags);
}
