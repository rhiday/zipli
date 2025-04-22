import { createWorker } from 'tesseract.js';

const QUANTITY_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*(kg|g|gram|grams|kilos?|kilograms?)/i,
  /(\d+(?:\.\d+)?)\s*(l|ml|liter|liters|milliliter|milliliters)/i,
  /(\d+(?:\.\d+)?)\s*(pcs|pieces|items|portions|servings|pack|packs|box|boxes)/i
];

const cleanText = (text: string): string => {
  return text
    .replace(/[^\w\s.,()-]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')         // Normalize spaces
    .trim();
};

const extractMenuText = (text: string): string => {
  const lines = text.split('\n');
  
  // Find the first line that contains both text and a quantity
  const menuLine = lines
    .map(line => line.trim())
    .find(line => line && QUANTITY_PATTERNS.some(pattern => pattern.test(line)));
  
  return menuLine ? `🍽 ${menuLine}` : '';
};

export const processMenuImage = async (image: File): Promise<string> => {
  let worker;
  let imageUrl;
  
  try {
    // Remove the logger function to prevent DataCloneError
    worker = await createWorker();
    
    // Configure worker for better accuracy with explicit error handling
    try {
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,()-',
        tessedit_pageseg_mode: '6', // Assume uniform text block
      });
    } catch (error) {
      console.error('Error setting Tesseract parameters:', error);
      // Continue with default parameters
    }
    
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    imageUrl = URL.createObjectURL(image);
    
    // Recognize text with explicit rectangle parameter
    const { data: { text } } = await worker.recognize(imageUrl, {
      rectangle: undefined, // Don't use rectangle parameter to avoid null reference
      classify_bln_numeric_mode: 1,
      textord_heavy_nr: 1,
      tessedit_do_invert: 0
    });

    if (!text) {
      console.log('No text detected in image');
      return '';
    }

    const cleanedText = cleanText(text);
    const menuText = extractMenuText(cleanedText);

    return menuText;
  } catch (error) {
    console.error('Error processing menu image:', error);
    throw error; // Rethrow to handle in the component
  } finally {
    // Cleanup resources
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    if (worker) {
      try {
        await worker.terminate();
      } catch (error) {
        console.error('Error terminating Tesseract worker:', error);
      }
    }
  }
};