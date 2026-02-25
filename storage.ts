export interface UserProgress {
  [letter: string]: number;
}

const API_URL = '/api/progress';

export const loadProgress = async (): Promise<UserProgress> => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return await res.json();
  } catch (e) {
    console.error("Failed to load progress", e);
    return {};
  }
};

export const saveLetterScore = async (letter: string, stars: number) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter, stars }),
    });
  } catch (e) {
    console.error("Failed to save progress", e);
  }
};

export const resetProgress = async () => {
  try {
    await fetch(API_URL, { method: 'DELETE' });
  } catch (e) {
    console.error("Failed to reset progress", e);
  }
};

// Debug helper - might need to adjust or remove since it's client-side logic trying to write to server
export const debugFillProgress = async (letters: string[]) => {
  for (const l of letters) {
    await saveLetterScore(l, Math.floor(Math.random() * 4));
  }
};
