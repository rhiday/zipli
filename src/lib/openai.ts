// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true
// });

const ERROR_MESSAGE = 'Food items not recognized. Please try again. Mention what you want to donate and quantity.';

// Comprehensive food categories and common items
const FOOD_CATEGORIES = {
  vegetables: [
    'capsicum', 'bell pepper', 'pepper', 'tomato', 'potato', 'carrot', 'onion',
    'cucumber', 'lettuce', 'spinach', 'cabbage', 'broccoli', 'cauliflower',
    'zucchini', 'eggplant', 'aubergine', 'pumpkin', 'squash', 'celery',
    'mushroom', 'garlic', 'ginger', 'corn', 'peas', 'beans'
  ],
  fruits: [
    'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry',
    'raspberry', 'blackberry', 'mango', 'pineapple', 'peach', 'pear',
    'plum', 'cherry', 'watermelon', 'melon', 'kiwi', 'lemon', 'lime',
    'coconut', 'avocado', 'fig', 'date'
  ],
  grains: [
    'rice', 'wheat', 'flour', 'bread', 'pasta', 'noodle', 'cereal',
    'oat', 'quinoa', 'barley', 'corn', 'couscous', 'bulgur', 'spaghetti'
  ],
  proteins: [
    'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna',
    'shrimp', 'egg', 'tofu', 'tempeh', 'bean', 'lentil', 'chickpea'
  ],
  dairy: [
    'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream',
    'cottage cheese', 'sour cream', 'whey', 'curd'
  ],
  prepared: [
    'soup', 'stew', 'curry', 'sauce', 'salad', 'sandwich', 'pizza',
    'pasta', 'casserole', 'lasagna', 'pie', 'cake', 'bread'
  ]
};

// Units of measurement with variations
const UNITS = {
  weight: [
    'kg', 'kilo', 'kilos', 'kilogram', 'kilograms',
    'g', 'gram', 'grams',
    'lb', 'lbs', 'pound', 'pounds',
    'oz', 'ounce', 'ounces'
  ],
  volume: [
    'l', 'liter', 'liters', 'litre', 'litres',
    'ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres',
    'cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons',
    'tsp', 'teaspoon', 'teaspoons'
  ],
  count: [
    'piece', 'pieces', 'pc', 'pcs',
    'dozen', 'dozens',
    'pack', 'packs', 'package', 'packages',
    'box', 'boxes',
    'can', 'cans',
    'bottle', 'bottles',
    'container', 'containers',
    'bag', 'bags',
    'portion', 'portions',
    'serving', 'servings'
  ]
};

const validateFoodItems = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const hasFoodItem = Object.values(FOOD_CATEGORIES).some(category =>
    category.some(item => lowerText.includes(item))
  );

  const allUnits = [...Object.values(UNITS).flat()];
  const quantityPattern = new RegExp(
    `\\b(\\d+(?:\\.\\d+)?\\s*(?:${allUnits.join('|')})s?)\\b|` +
    '\\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten)\\s+' +
    `(?:${allUnits.join('|')})s?\\b`,
    'i'
  );

  const hasQuantity = quantityPattern.test(text);
  const words = text.split(/\s+/).length;
  const isLongDescription = words > 5;

  return hasFoodItem || (hasQuantity && isLongDescription);
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Mock implementation - return dummy data
    return "I would like to donate 2 cans of soup, a bag of rice, and some fresh vegetables.";
    
    // Original implementation
    // const audioFile = new File([audioBlob], 'audio.webm', { 
    //   type: 'audio/webm' 
    // });
    
    // const response = await openai.audio.transcriptions.create({
    //   file: audioFile,
    //   model: 'whisper-1',
    //   language: 'en',
    //   response_format: 'text',
    //   temperature: 0.2,
    //   prompt: 'This is a food donation description including quantities and types of food items.'
    // });

    // return response;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    // Mock implementation - return formatted response
    return `🥫 Soup - 2 cans
🍚 Rice - 1 bag
🥬 Fresh Vegetables - assorted`;
    
    // Original implementation
    // if (!validateFoodItems(text)) {
    //   return ERROR_MESSAGE;
    // }

    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: `You are a food donation assistant. Format each food item on a new line using emojis. Follow these rules:

    //       1. Each line should follow this format:
    //          [Food emoji] [Food name] - [Quantity]

    //       2. Use the most specific and accurate food emoji based on these rules:
    //          
    //          PRODUCE:
    //          - 🥕 for carrots
    //          - 🥔 for potatoes
    //          - 🧅 for onions
    //          - 🫑 for peppers/capsicum
    //          - 🍅 for tomatoes
    //          - 🥬 for leafy greens
    //          - 🥦 for broccoli/cauliflower
    //          - 🍆 for eggplant/aubergine
    //          - 🥒 for cucumber
    //          - 🌽 for corn
    //          - 🍄 for mushrooms
    //          
    //          FRUITS:
    //          - 🍎 for apples
    //          - 🍌 for bananas
    //          - 🍊 for oranges/citrus
    //          - 🍇 for grapes
    //          - 🥝 for kiwi
    //          - 🥭 for mango
    //          - 🍑 for peach
    //          - 🍐 for pear
    //          - 🫐 for berries
    //          
    //          PROTEINS:
    //          - 🥩 for beef/red meat
    //          - 🍗 for chicken/poultry
    //          - 🥚 for eggs
    //          - 🐟 for fish/tuna/salmon
    //          - 🦐 for seafood
    //          - 🫘 for beans/legumes
    //          
    //          DAIRY:
    //          - 🥛 for milk
    //          - 🧀 for cheese
    //          - 🫓 for yogurt
    //          - 🧈 for butter
    //          
    //          GRAINS & PASTA:
    //          - 🍚 for rice
    //          - 🥖 for bread
    //          - 🍝 for pasta/noodles
    //          - 🥣 for cereal/oats
    //          
    //          PREPARED FOODS:
    //          - 🍲 for soups/stews
    //          - 🥘 for prepared meals
    //          - 🥗 for salads
    //          - 🥪 for sandwiches
    //       
    //       3. Group similar items together
    //       
    //       4. Be precise with food names
    //       
    //       5. If quantity is unclear, ask for clarification
    //       
    //       6. Maintain original food names when possible

    //       Example:
    //       🌽 Sweet Corn - 3 cans
    //       🐟 Tuna - 4 cans
    //       🍝 Fresh Spaghetti - 2 kg
    //       🥕 Organic Carrots - 1 kg
    //       �� Roasted Chicken - 2 portions`
    //     },
    //     {
    //       role: "user",
    //       content: `Format this food donation: ${text}`
    //     }
    //   ],
    //   temperature: 0.3,
    //   max_tokens: 500
    // });

    // const summary = response.choices[0].message.content;
    // return summary || ERROR_MESSAGE;
  } catch (error) {
    console.error('Error summarizing text:', error);
    return ERROR_MESSAGE;
  }
};

export const simplifyText = async (text: string): Promise<string> => {
  try {
    // Mock implementation - return formatted response
    return `🥫 Soup - 2 cans
🍚 Rice - 1 bag
🥬 Fresh Vegetables - assorted`;
    
    // Original implementation
    // if (!validateFoodItems(text)) {
    //   return ERROR_MESSAGE;
    // }

    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     {
    //       role: "system",
    //       content: `Create a list of food items with emojis. Follow these rules:

    //       1. Each line should follow this format:
    //          [Food emoji] [Food name] - [Quantity]

    //       2. Use the most specific and accurate food emoji based on these rules:
    //          
    //          PRODUCE:
    //          - �� for carrots
    //          - 🥔 for potatoes
    //          - 🧅 for onions
    //          - 🫑 for peppers/capsicum
    //          - 🍅 for tomatoes
    //          - 🥬 for leafy greens
    //          - 🥦 for broccoli/cauliflower
    //          - 🍆 for eggplant/aubergine
    //          - 🥒 for cucumber
    //          - 🌽 for corn
    //          - 🍄 for mushrooms
    //          
    //          FRUITS:
    //          - 🍎 for apples
    //          - 🍌 for bananas
    //          - 🍊 for oranges/citrus
    //          - 🍇 for grapes
    //          - 🥝 for kiwi
    //          - 🥭 for mango
    //          - 🍑 for peach
    //          - 🍐 for pear
    //          - 🫐 for berries
    //          
    //          PROTEINS:
    //          - 🥩 for beef/red meat
    //          - 🍗 for chicken/poultry
    //          - 🥚 for eggs
    //          - 🐟 for fish/tuna/salmon
    //          - �� for seafood
    //          - 🫘 for beans/legumes
    //          
    //          DAIRY:
    //          - 🥛 for milk
    //          - 🧀 for cheese
    //          - 🫓 for yogurt
    //          - 🧈 for butter
    //          
    //          GRAINS & PASTA:
    //          - 🍚 for rice
    //          - 🥖 for bread
    //          - 🍝 for pasta/noodles
    //          - 🥣 for cereal/oats
    //          
    //          PREPARED FOODS:
    //          - 🍲 for soups/stews
    //          - 🥘 for prepared meals
    //          - 🥗 for salads
    //          - 🥪 for sandwiches
    //       
    //       3. Group similar items together
    //       
    //       4. Keep original food names
    //       
    //       5. Convert quantities to standard units
    //       
    //       6. Maximum 10 items, combine similar items if more

    //       Example:
    //       🌽 Sweet Corn - 3 cans
    //       🐟 Tuna - 4 cans
    //       🍝 Fresh Spaghetti - 2 kg
    //       🥕 Organic Carrots - 1 kg
    //       🍗 Roasted Chicken - 2 portions`
    //     },
    //     {
    //       role: "user",
    //       content: `Create a list from this food donation: ${text}`
    //     }
    //   ],
    //   temperature: 0.3,
    //   max_tokens: 500
    // });

    // const summary = response.choices[0].message.content;
    // return summary || ERROR_MESSAGE;
  } catch (error) {
    console.error('Error simplifying text:', error);
    return ERROR_MESSAGE;
  }
};