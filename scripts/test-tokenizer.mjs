const STOPWORDS = new Set([
  "the","a","an","and","or","but","of","to","in","on","at","by","from","with","is","are","was","were",
  "india","indian","business","economy","economic","new","growth","market",
  "は","が","の","を","に","で","と","も","から","まで","これ","その","この","それ","あれ",
  "です","ます","した","する","ある","いる","こと","もの","ため","よう","など",
])
const MIN_TOKEN_LENGTH = 3
const CJK_RUN_REGEX = /[぀-ゟ゠-ヿ一-鿿㐀-䶿]+/gu
const CJK_CHAR_REGEX = /[぀-ゟ゠-ヿ一-鿿㐀-䶿]/

function extractKeywords(title, body, n) {
  const weightedText = `${title} ${title} ${title} ${body ?? ""}`
  const rawTokens = weightedText
    .split(/[\s\n\r\t]+/)
    .map((t) => t.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)
  const scores = new Map()
  for (const raw of rawTokens) {
    if (CJK_CHAR_REGEX.test(raw)) {
      for (const latinRun of raw.match(/[A-Za-z0-9]+/g) ?? []) {
        if (latinRun.length < MIN_TOKEN_LENGTH) continue
        const lower = latinRun.toLowerCase()
        if (STOPWORDS.has(lower)) continue
        const isProperNoun = /^[A-Z]/.test(latinRun)
        const boost = isProperNoun ? 2 : 0
        scores.set(lower, (scores.get(lower) ?? 0) + 1 + boost)
      }
      continue
    }
    if (raw.length < MIN_TOKEN_LENGTH) continue
    const lower = raw.toLowerCase()
    if (STOPWORDS.has(lower)) continue
    const isProperNoun = /^[A-Z]/.test(raw)
    const boost = isProperNoun ? 2 : 0
    scores.set(lower, (scores.get(lower) ?? 0) + 1 + boost)
  }
  for (const run of weightedText.match(CJK_RUN_REGEX) ?? []) {
    if (run.length < 2) continue
    for (let i = 0; i < run.length - 1; i++) {
      const bigram = run.slice(i, i + 2)
      if (STOPWORDS.has(bigram)) continue
      scores.set(bigram, (scores.get(bigram) ?? 0) + 1)
    }
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([t]) => t)
}

const cases = [
  { id: "JP-A", title: "インド経済、6.6%成長見通し RBIが金融政策を維持", body: "" },
  { id: "JP-B", title: "トヨタ インドに新工場建設へ 成長市場で生産強化", body: "Toyota plans EV production." },
  { id: "JP-C", title: "インド株価、モディ政権の緊縮策で下落 金融政策に注目", body: "" },
  { id: "EN-A", title: "Moody's slashes 2026 India growth forecast to 6% as RBI holds rates", body: "Manufacturing weakness cited." },
  { id: "EN-B", title: "Toyota plans new India factory for EVs amid 6% growth", body: "Japanese carmaker eyes Indian EV market." },
]

const results = cases.map((c) => ({ id: c.id, title: c.title, kws: extractKeywords(c.title, c.body, 12) }))
for (const r of results) console.log(`${r.id}  [${r.kws.join(", ")}]`)

console.log("\n=== Pair overlap (need 3+ to cluster) ===")
const sets = results.map((r) => ({ id: r.id, set: new Set(r.kws) }))
for (let i = 0; i < sets.length; i++) {
  for (let j = i + 1; j < sets.length; j++) {
    const shared = [...sets[i].set].filter((k) => sets[j].set.has(k))
    const marker = shared.length >= 3 ? "Y" : " "
    console.log(`${marker} ${sets[i].id} ∩ ${sets[j].id}: ${shared.length} → [${shared.join(", ")}]`)
  }
}
