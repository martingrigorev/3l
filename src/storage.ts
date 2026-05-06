// Simple text-based database using localStorage
const STORAGE_KEY = 'lev_learning_progress';
const SEA_ANIMALS_STORAGE_KEY = 'lev_sea_animals_progress';

export interface UserProgress {
  [id: string]: number; 
}

// Load all progress from the "database"
export const loadProgress = (): UserProgress => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load progress", e);
    return {};
  }
};

export const loadSeaAnimalsProgress = (): UserProgress => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(SEA_ANIMALS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load sea animals progress", e);
    return {};
  }
};

// Save score for a specific letter
export const saveLetterScore = (letter: string, stars: number) => {
  const current = loadProgress();
  current[letter] = stars;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export const saveSeaAnimalScore = (animalId: string, stars: number) => {
  const current = loadSeaAnimalsProgress();
  current[animalId] = stars;
  localStorage.setItem(SEA_ANIMALS_STORAGE_KEY, JSON.stringify(current));
};

// Erase the entire database
export const resetProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SEA_ANIMALS_STORAGE_KEY);
  // Also clear any other potential keys starting with 'lev_' just in case
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('lev_')) {
      localStorage.removeItem(key);
    }
  });
};

// Helper for debugging/testing: set random scores
export const debugFillProgress = (letters: string[]) => {
  const fakeData: UserProgress = {};
  letters.forEach(l => {
    fakeData[l] = Math.floor(Math.random() * 4); // 0 to 3
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeData));
};