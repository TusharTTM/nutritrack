// Curated, evidence-based nutrition guidance shown as rotating "Daily insight"
// cards and data-driven nudges. Sources: USDA Dietary Guidelines, NHS Eatwell,
// and registered-dietitian consensus (protein + fibre at every meal, hydration,
// whole foods, plant variety, healthy fats).
export const NUTRITION_TIPS = [
  { id: 'protein', tag: 'Protein', icon: 'barbell-outline', title: 'Lead with protein at every meal', body: 'Aim for 20–30g of protein per meal. It preserves muscle, keeps you full, and steadies blood sugar.' },
  { id: 'fiber', tag: 'Fibre', icon: 'leaf-outline', title: 'Reach 25–30g of fibre a day', body: 'Legumes, oats, quinoa and leafy greens feed your gut and curb cravings. Increase gradually, with water.' },
  { id: 'hydration', tag: 'Hydration', icon: 'water-outline', title: 'Drink before you feel thirsty', body: 'Roughly 2–3 litres daily aids digestion and focus. Thirst is easily mistaken for hunger.' },
  { id: 'plate', tag: 'Balance', icon: 'pie-chart-outline', title: 'Build a balanced plate', body: 'Half vegetables, a quarter lean protein, a quarter whole grains — the simplest way to eat well.' },
  { id: 'wholefoods', tag: 'Whole foods', icon: 'nutrition-outline', title: 'Choose whole over processed', body: 'Minimally processed foods bring more nutrients and fibre, and help regulate appetite naturally.' },
  { id: 'fats', tag: 'Healthy fats', icon: 'heart-outline', title: 'Include healthy fats', body: 'Olive oil, avocado, nuts and oily fish support heart health and help absorb vitamins.' },
  { id: 'omega3', tag: 'Omega-3', icon: 'fish-outline', title: 'Add omega-3 rich foods', body: 'Salmon, walnuts, flax and chia support heart and brain health. A few servings a week is plenty.' },
  { id: 'variety', tag: 'Variety', icon: 'color-palette-outline', title: 'Eat a rainbow of plants', body: 'Aiming for 30 different plants a week diversifies your gut microbiome and nutrient intake.' },
  { id: 'gut', tag: 'Gut health', icon: 'flask-outline', title: 'Feed your gut', body: 'Yogurt, kefir, kimchi and sauerkraut add beneficial probiotics that work alongside fibre.' },
  { id: 'sugar', tag: 'Sugar', icon: 'warning-outline', title: 'Limit added sugar', body: 'Cutting sugary drinks and refined carbs steadies energy and supports metabolic health.' },
  { id: 'prep', tag: 'Habits', icon: 'calendar-outline', title: 'Prep ahead', body: 'Batch-cooking protein and grains removes daily decision fatigue and prevents impulse choices.' },
  { id: 'mindful', tag: 'Mindful', icon: 'pause-outline', title: 'Slow down mid-meal', body: 'Pausing halfway through a meal lets satiety signals catch up, so you eat the right amount.' },
  { id: 'breakfast', tag: 'Breakfast', icon: 'sunny-outline', title: 'Protein at breakfast', body: '25–30g of protein within a couple of hours of waking helps appetite control through the day.' },
  { id: 'snacks', tag: 'Snacks', icon: 'cafe-outline', title: 'Plan smart snacks', body: 'Keep Greek yogurt, fruit or nuts handy so hunger does not steer you to the vending machine.' },
];

// Data-driven nudges keyed to the user's own intake. Each has a `when` predicate
// evaluated against today's totals/goals; the first match is surfaced.
export const NUDGES = [
  {
    id: 'protein-low', tag: 'Nudge', icon: 'barbell-outline',
    title: 'Protein is running low',
    body: 'Add a lean source — eggs, yogurt, chicken, tofu or lentils — to your next meal.',
    when: (t, g) => g.protein > 0 && t.protein < g.protein * 0.6,
  },
  {
    id: 'fiber-low', tag: 'Nudge', icon: 'leaf-outline',
    title: 'Fibre could use a boost',
    body: 'Add beans, berries, oats or an extra serve of vegetables to reach your fibre goal.',
    when: (t, g) => g.fiber > 0 && t.fiber < g.fiber * 0.6,
  },
  {
    id: 'water-low', tag: 'Nudge', icon: 'water-outline',
    title: 'Time to hydrate',
    body: 'Drink a glass of water now — staying hydrated helps energy and curbs false hunger.',
    when: (t, g) => g.water > 0 && t.water < g.water * 0.6,
  },
  {
    id: 'calories-over', tag: 'Nudge', icon: 'speedometer-outline',
    title: 'Over today’s calorie goal',
    body: 'No guilt — a lighter, protein-forward next meal and a walk help you rebalance.',
    when: (t, g) => g.calories > 0 && t.calories > g.calories * 1.05,
  },
  {
    id: 'on-track', tag: 'Nice work', icon: 'ribbon-outline',
    title: 'You’re on track today',
    body: 'Protein, fibre and hydration are close to goal. Keep the streak going!',
    when: (t, g) => g.protein > 0 && t.protein >= g.protein * 0.8 && t.water >= g.water * 0.8,
  },
];
