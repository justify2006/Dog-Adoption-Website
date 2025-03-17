'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchBreedImages } from '../../../lib/dogutils';

export default function BreedDetailsPage() {
  const params = useParams();
  const breed = params.breed as string;
  
  const [breedImages, setBreedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (!breed) return;
    
    async function loadBreedImages() {
      setLoading(true);
      const images = await fetchBreedImages(breed, 9);
      setBreedImages(images);
      setLoading(false);
    }
    
    loadBreedImages();
  }, [breed]);
  
  if (!breed) return null;
  
  const displayBreed = breed.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{displayBreed} Dogs</h1>
      
      {loading ? (
        <div className="text-center py-12">Loading {displayBreed} images...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {breedImages.map((imageUrl, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-md">
              <img 
                src={imageUrl} 
                alt={`${displayBreed} dog`} 
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}