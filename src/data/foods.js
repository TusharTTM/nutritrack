export const foodDatabase = [
  // Fruits
  { id: 'f1', name: 'Banana', category: 'Fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, serving: '1 medium (118g)' },
  { id: 'f2', name: 'Apple', category: 'Fruits', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, serving: '1 medium (182g)' },
  { id: 'f3', name: 'Orange', category: 'Fruits', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, serving: '1 medium (131g)' },
  { id: 'f4', name: 'Blueberries', category: 'Fruits', calories: 84, protein: 1.1, carbs: 21, fat: 0.5, fiber: 3.6, serving: '1 cup (148g)' },
  { id: 'f5', name: 'Strawberries', category: 'Fruits', calories: 49, protein: 1.0, carbs: 12, fat: 0.5, fiber: 3.0, serving: '1 cup (152g)' },
  { id: 'f6', name: 'Avocado', category: 'Fruits', calories: 240, protein: 3, carbs: 13, fat: 22, fiber: 10, serving: '1 whole (200g)' },
  { id: 'f7', name: 'Mango', category: 'Fruits', calories: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6, serving: '1 cup (165g)' },
  // Vegetables
  { id: 'v1', name: 'Broccoli', category: 'Vegetables', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5.1, serving: '1 cup (91g)' },
  { id: 'v2', name: 'Spinach', category: 'Vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, serving: '100g' },
  { id: 'v3', name: 'Sweet Potato', category: 'Vegetables', calories: 103, protein: 2.3, carbs: 24, fat: 0.1, fiber: 3.8, serving: '1 medium (130g)' },
  { id: 'v4', name: 'Carrot', category: 'Vegetables', calories: 52, protein: 1.2, carbs: 12, fat: 0.3, fiber: 3.6, serving: '1 large (72g)' },
  { id: 'v5', name: 'Tomato', category: 'Vegetables', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5, serving: '1 medium (123g)' },
  { id: 'v6', name: 'Kale', category: 'Vegetables', calories: 33, protein: 2.9, carbs: 6.7, fat: 0.5, fiber: 1.3, serving: '1 cup (67g)' },
  // Proteins
  { id: 'p1', name: 'Chicken Breast', category: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, serving: '100g cooked' },
  { id: 'p2', name: 'Salmon', category: 'Protein', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, serving: '100g' },
  { id: 'p3', name: 'Egg', category: 'Protein', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, serving: '1 large (50g)' },
  { id: 'p4', name: 'Tuna (canned)', category: 'Protein', calories: 132, protein: 29, carbs: 0, fat: 1, fiber: 0, serving: '100g' },
  { id: 'p5', name: 'Turkey Breast', category: 'Protein', calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, serving: '100g' },
  { id: 'p6', name: 'Tofu (firm)', category: 'Protein', calories: 144, protein: 17, carbs: 3, fat: 9, fiber: 0.3, serving: '1/2 block (170g)' },
  { id: 'p7', name: 'Shrimp', category: 'Protein', calories: 99, protein: 24, carbs: 0, fat: 0.3, fiber: 0, serving: '100g' },
  // Dairy
  { id: 'd1', name: 'Greek Yogurt (non-fat)', category: 'Dairy', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, serving: '170g' },
  { id: 'd2', name: 'Milk (whole)', category: 'Dairy', calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, serving: '1 cup (244ml)' },
  { id: 'd3', name: 'Cheddar Cheese', category: 'Dairy', calories: 113, protein: 7, carbs: 0.4, fat: 9, fiber: 0, serving: '1 oz (28g)' },
  { id: 'd4', name: 'Cottage Cheese', category: 'Dairy', calories: 206, protein: 25, carbs: 8, fat: 9, fiber: 0, serving: '1 cup (226g)' },
  // Grains
  { id: 'g1', name: 'Brown Rice', category: 'Grains', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, serving: '1 cup cooked (195g)' },
  { id: 'g2', name: 'Oatmeal', category: 'Grains', calories: 158, protein: 6, carbs: 27, fat: 3.2, fiber: 4, serving: '1 cup cooked (234g)' },
  { id: 'g3', name: 'Quinoa', category: 'Grains', calories: 222, protein: 8, carbs: 39, fat: 3.5, fiber: 5, serving: '1 cup cooked (185g)' },
  { id: 'g4', name: 'Whole Wheat Bread', category: 'Grains', calories: 69, protein: 3.6, carbs: 12, fat: 1, fiber: 1.9, serving: '1 slice (28g)' },
  { id: 'g5', name: 'White Rice', category: 'Grains', calories: 206, protein: 4.3, carbs: 45, fat: 0.4, fiber: 0.6, serving: '1 cup cooked (186g)' },
  { id: 'g6', name: 'Pasta (whole wheat)', category: 'Grains', calories: 174, protein: 7.5, carbs: 37, fat: 0.8, fiber: 4.2, serving: '1 cup cooked (140g)' },
  // Legumes
  { id: 'l1', name: 'Lentils', category: 'Legumes', calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 15.6, serving: '1 cup cooked (198g)' },
  { id: 'l2', name: 'Black Beans', category: 'Legumes', calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15, serving: '1 cup cooked (172g)' },
  { id: 'l3', name: 'Chickpeas', category: 'Legumes', calories: 269, protein: 15, carbs: 45, fat: 4.2, fiber: 12.5, serving: '1 cup cooked (164g)' },
  // Nuts & Seeds
  { id: 'n1', name: 'Almonds', category: 'Nuts & Seeds', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, serving: '1 oz (28g)' },
  { id: 'n2', name: 'Peanut Butter', category: 'Nuts & Seeds', calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 1.9, serving: '2 tbsp (32g)' },
  { id: 'n3', name: 'Chia Seeds', category: 'Nuts & Seeds', calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, serving: '2 tbsp (28g)' },
  { id: 'n4', name: 'Walnuts', category: 'Nuts & Seeds', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, serving: '1 oz (28g)' },
  // Snacks / Other
  { id: 's1', name: 'Protein Bar', category: 'Snacks', calories: 200, protein: 20, carbs: 22, fat: 8, fiber: 5, serving: '1 bar (60g)' },
  { id: 's2', name: 'Dark Chocolate (70%)', category: 'Snacks', calories: 170, protein: 2, carbs: 13, fat: 12, fiber: 2, serving: '1 oz (28g)' },
  { id: 's3', name: 'Hummus', category: 'Snacks', calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, serving: '100g' },
  { id: 's4', name: 'Rice Cakes', category: 'Snacks', calories: 35, protein: 0.7, carbs: 7.3, fat: 0.3, fiber: 0.4, serving: '1 cake (9g)' },
  // Beverages
  { id: 'b1', name: 'Protein Shake', category: 'Beverages', calories: 150, protein: 25, carbs: 7, fat: 3, fiber: 1, serving: '1 scoop (30g) + 250ml milk' },
  { id: 'b2', name: 'Orange Juice', category: 'Beverages', calories: 112, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5, serving: '1 cup (248ml)' },
  { id: 'b3', name: 'Banana Milkshake', category: 'Beverages', calories: 230, protein: 8, carbs: 40, fat: 5, fiber: 1.2, serving: '1 glass (300ml)' },
  { id: 'b4', name: 'Mango Lassi', category: 'Beverages', calories: 200, protein: 5, carbs: 38, fat: 4, fiber: 0.8, serving: '1 glass (300ml)' },
  // Indian Foods
  { id: 'i1', name: 'Chole Bhature', category: 'Indian', calories: 450, protein: 12, carbs: 62, fat: 16, fiber: 6, serving: '1 plate (250g)' },
  { id: 'i2', name: 'Chicken Biryani', category: 'Indian', calories: 420, protein: 22, carbs: 55, fat: 12, fiber: 2, serving: '1 plate (250g)' },
  { id: 'i3', name: 'Dal Tadka', category: 'Indian', calories: 180, protein: 10, carbs: 28, fat: 5, fiber: 7, serving: '1 bowl (200g)' },
  { id: 'i4', name: 'Paneer Butter Masala', category: 'Indian', calories: 320, protein: 14, carbs: 18, fat: 22, fiber: 2, serving: '1 bowl (200g)' },
  { id: 'i5', name: 'Roti (Chapati)', category: 'Indian', calories: 80, protein: 3, carbs: 15, fat: 1.5, fiber: 2, serving: '1 piece (40g)' },
  { id: 'i6', name: 'Idli', category: 'Indian', calories: 58, protein: 2, carbs: 12, fat: 0.2, fiber: 0.5, serving: '1 piece (39g)' },
  { id: 'i7', name: 'Dosa (plain)', category: 'Indian', calories: 120, protein: 3, carbs: 22, fat: 2.5, fiber: 1, serving: '1 dosa (70g)' },
  { id: 'i8', name: 'Samosa', category: 'Indian', calories: 150, protein: 3, carbs: 18, fat: 8, fiber: 2, serving: '1 piece (55g)' },
  { id: 'i9', name: 'Banana Chips', category: 'Snacks', calories: 150, protein: 1, carbs: 18, fat: 9, fiber: 1.5, serving: '1 small pack (30g)' },
  { id: 'i10', name: 'Poha', category: 'Indian', calories: 180, protein: 4, carbs: 34, fat: 4, fiber: 2, serving: '1 bowl (150g)' },
  { id: 'i11', name: 'Upma', category: 'Indian', calories: 200, protein: 5, carbs: 36, fat: 5, fiber: 3, serving: '1 bowl (180g)' },
  { id: 'i12', name: 'Palak Paneer', category: 'Indian', calories: 260, protein: 12, carbs: 14, fat: 18, fiber: 3, serving: '1 bowl (200g)' },
  { id: 'i13', name: 'Rajma', category: 'Indian', calories: 210, protein: 13, carbs: 35, fat: 2, fiber: 9, serving: '1 bowl (200g)' },
  { id: 'i14', name: 'Aloo Paratha', category: 'Indian', calories: 260, protein: 6, carbs: 40, fat: 9, fiber: 3, serving: '1 paratha (100g)' },
  { id: 'i15', name: 'Masala Oats', category: 'Indian', calories: 160, protein: 5, carbs: 28, fat: 3, fiber: 4, serving: '1 bowl (160g)' },
];

export const foodCategories = ['All', 'Fruits', 'Vegetables', 'Protein', 'Dairy', 'Grains', 'Legumes', 'Nuts & Seeds', 'Snacks', 'Beverages', 'Indian'];

export const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const mealIcons = {
  Breakfast: '🌅',
  Lunch: '☀️',
  Dinner: '🌙',
  Snacks: '🍎',
};

export const activityDatabase = [
  { id: 'a1', name: 'Walking', icon: '🚶', category: 'Cardio', metValue: 3.5 },
  { id: 'a2', name: 'Running', icon: '🏃', category: 'Cardio', metValue: 8.0 },
  { id: 'a3', name: 'Cycling', icon: '🚴', category: 'Cardio', metValue: 7.5 },
  { id: 'a4', name: 'Swimming', icon: '🏊', category: 'Cardio', metValue: 7.0 },
  { id: 'a5', name: 'Yoga', icon: '🧘', category: 'Flexibility', metValue: 2.5 },
  { id: 'a6', name: 'Weight Training', icon: '🏋️', category: 'Strength', metValue: 5.0 },
  { id: 'a7', name: 'HIIT', icon: '⚡', category: 'Cardio', metValue: 10.0 },
  { id: 'a8', name: 'Pilates', icon: '🤸', category: 'Flexibility', metValue: 3.0 },
  { id: 'a9', name: 'Basketball', icon: '🏀', category: 'Sport', metValue: 6.5 },
  { id: 'a10', name: 'Football', icon: '⚽', category: 'Sport', metValue: 7.0 },
  { id: 'a11', name: 'Tennis', icon: '🎾', category: 'Sport', metValue: 7.3 },
  { id: 'a12', name: 'Dancing', icon: '💃', category: 'Cardio', metValue: 4.5 },
  { id: 'a13', name: 'Jump Rope', icon: '🪢', category: 'Cardio', metValue: 11.0 },
  { id: 'a14', name: 'Hiking', icon: '🥾', category: 'Cardio', metValue: 5.3 },
  { id: 'a15', name: 'Rowing', icon: '🚣', category: 'Cardio', metValue: 7.0 },
  { id: 'a16', name: 'Custom', icon: '✨', category: 'Other', metValue: 5.0 },
];

// MET-based calorie calculation: calories = MET × weight(kg) × time(hours)
export const calcActivityCalories = (metValue, weightKg, durationMinutes) => {
  return Math.round(metValue * weightKg * (durationMinutes / 60));
};

export const defaultGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 25,
  water: 2000,
  steps: 8000,
  activeMinutes: 30,
};
