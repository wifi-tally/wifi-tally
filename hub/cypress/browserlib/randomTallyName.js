// I'm keen on random names :D

const adjectives = [
  "broken",
  "dark",
  "fiery",
  "funny",
  "golden",
  "green",
  "happy",
  "important",
  "jealous",
  "joyous",
  "keen",
  "lively",
  "medical",
  "merciful",
  "necessary",
  "pure",
  "red",
  "spiky",
  "sticky",
  "violet",
  "young",
]
const nouns = [
  "arrow",
  "bird",
  "blood",
  "boat",
  "car",
  "cloud",
  "crocodile",
  "engine",
  "fire",
  "gift",
  "goose",
  "king",
  "lake",
  "love",
  "meadow",
  "mushroom",
  "power",
  "queen",
  "rain",
  "ring",
  "rose",
  "sand",
  "sea",
  "shadow",
  "sky",
  "song",
  "star",
  "storm",
  "sun",
  "troll",
  "wheel",
  "wing",
  "zone",
]

function randomTallyName() {
  const adjective = adjectives[Math.floor(Math.random()*adjectives.length)]
  const noun = nouns[Math.floor(Math.random()*nouns.length)]
  return `${adjective}-${noun}`
}

export default randomTallyName