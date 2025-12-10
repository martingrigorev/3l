// Simple text-based database using localStorage
const STORAGE_KEY = 'lev_learning_progress';

export interface UserProgress {
  [letter: string]: number; // Maps a letter (e.g., "А") to a star count (0-3)
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

// Save score for a specific letter
export const saveLetterScore = (letter: string, stars: number) => {
  const current = loadProgress();
  // Only update if the new score is higher (optional, but usually preferred in games)
  // Or just overwrite if we want to reflect the latest attempt. 
  // For now, let's overwrite to allow re-playing.
  current[letter] = stars;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

// Erase the entire database
export const resetProgress = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Helper for debugging/testing: set random scores
export const debugFillProgress = (letters: string[]) => {
  const fakeData: UserProgress = {};
  letters.forEach(l => {
    fakeData[l] = Math.floor(Math.random() * 4); // 0 to 3
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeData));
};