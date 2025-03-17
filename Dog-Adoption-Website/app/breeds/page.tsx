'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAllBreeds } from '../../lib/dogutils';

export default function BreedsPage() {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function loadBreeds() {
      setLoading(true);
      const breedsList = await fetchAllBreeds();
      setBreeds(breedsList);
      setLoading(false);
    }
    loadBreeds();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dog Breeds</h1>
      <p className="mb-8">Browse dogs by breed and find your perfect match!</p>
      {loading ? (
        <div className="text-center py-12">Loading breeds...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {breeds.map((breed) => (
            <Link key={breed} href={`/breeds/${breed}`}>
              <div className="bg-white border rounded-lg p-4 hover:shadow-md transition duration-200">
                <h2 className="text-lg font-medium capitalize">
                  {breed.split('-').join(' ')}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}