// types/dogs.ts
export interface Dog {
    id: string;
    created_at: string;
    name: string;
    breed: string;
    age?: string;
    image_url: string;
    status: 'available' | 'pending' | 'adopted';
    description?: string;
  }
  
  export interface BreedInfo {
    breed: string;
    breedPath: string;
  }