
import { Dog, BreedInfo } from '../types/dogs';


export function getBreedFromImageUrl(imageUrl: string): BreedInfo {
  const urlParts = imageUrl.split('/');
  const breedPath = urlParts[4]; 
  const breed = breedPath.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return { 
    breed, 
    breedPath 
  };
}



export async function fetchBreedImages(breed: string, limit = 9): Promise<string[]> {
  try {
    const response = await fetch(`https://dog.ceo/api/breed/${breed}/images`);
    const data = await response.json();
    return data.message.slice(0, limit); 
  } catch (error) {
    console.error(`Error fetching ${breed} images:`, error);
    return [];
  }
}

export async function fetchAllBreeds(): Promise<string[]> {
  try {
    const response = await fetch('https://dog.ceo/api/breeds/list/all');
    const data = await response.json();
    return Object.keys(data.message); 
  } catch (error) {
    console.error('Error fetching breeds:', error);
    return [];
  }
}