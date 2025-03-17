'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import React from 'react';

interface Dog {
  id: string;
  created_at: string;
  name: string;
  breed: string;
  age?: string;
  image_url: string;
  status: 'available' | 'pending' | 'adopted';
  description?: string;
}

export default function DogDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  useEffect(() => {
    async function fetchDog() {
      try {
        if (!id) return;
        
        setLoading(true);
        const { data, error } = await supabase
          .from('dogs')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setDog(data);
      } catch (err: any) {
        console.error('Error fetching dog:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDog();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Loading dog details...</p>
      </div>
    );
  }
  
  if (error || !dog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error || 'Dog not found'}</p>
        </div>
        <Link href="/" className="text-blue-500 hover:underline">&larr; Back to all dogs</Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">&larr; Back to all dogs</Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={dog.image_url} 
              alt={dog.name} 
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="p-8 md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{dog.name}</h1>
            <p className="text-xl text-gray-600 mb-4">{dog.breed}</p>
            
            <div className="mb-6">
              <span className="text-gray-700 font-semibold">Age:</span> {dog.age || 'Not specified'}
            </div>
            
            <div className="mb-6">
              <span className="text-gray-700 font-semibold">Status:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                dog.status === 'available' ? 'bg-green-100 text-green-800' :
                dog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {dog.status.charAt(0).toUpperCase() + dog.status.slice(1)}
              </span>
            </div>
            
            <div className="mb-6">
              <span className="text-gray-700 font-semibold">Description:</span>
              <p className="mt-2 text-gray-600">{dog.description || `${dog.name} is a lovely ${dog.breed} looking for a forever home.`}</p>
            </div>
            
            {dog.status === 'available' && (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md">
                Apply to Adopt {dog.name}
              </button>
            )}
            
            {dog.status === 'pending' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">This dog has a pending adoption application.</p>
              </div>
            )}
            
            {dog.status === 'adopted' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-red-700">{dog.name} has already been adopted.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}