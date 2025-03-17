import Link from 'next/link';
import { getBreedFromImageUrl } from '../lib/dogutils';

interface DogCardProps {
  imageUrl: string;
  showBreedLink?: boolean;
}

export default function DogCard({ imageUrl, showBreedLink = true }: DogCardProps) {
  const { breed, breedPath } = getBreedFromImageUrl(imageUrl);
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      <div className="h-64 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={breed} 
          className="w-full h-full object-cover transition duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold">{breed}</h2>
        {showBreedLink && (
          <Link 
            href={`/breeds/${breedPath}`}
            className="mt-2 inline-block text-blue-500 hover:underline"
          >
            See more {breed} dogs
          </Link>
        )}
      </div>
    </div>
  );
}