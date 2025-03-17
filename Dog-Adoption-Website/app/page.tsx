'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Dog } from '../types/dogs';

export default function Home() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);
  
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const client = createClient(supabaseUrl, supabaseKey);
        setSupabase(client);
      } else {
        setError("Supabase environment variables are missing. Please check your configuration.");
      }
    }
  }, []);
  

  useEffect(() => {
    if (supabase) {
      fetchRandomDogs();
    }
  }, [supabase]);
  
  async function fetchRandomDogs() {
    try {
      setLoading(true);
      
   
      const { count, error: countError } = await supabase
        .from('dogs')
        .select('*', { count: 'exact', head: true });
        
      if (countError) throw countError;
      
   
      if (!count || count <= 6) {
        const { data, error } = await supabase
          .from('dogs')
          .select('*');
          
        if (error) throw error;
        setDogs(data || []);
        return;
      }
      
  
      const { data, error } = await supabase
        .from('dogs')
        .select('*');
        
      if (error) throw error;
      
   
      const shuffled = [...data];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Take the first 6 or fewer
      const selectedDogs = shuffled.slice(0, Math.min(6, shuffled.length));
      setDogs(selectedDogs);
    } catch (err: any) {
      console.error('Error fetching dogs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  

  if (!supabase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Furry Companion</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Find Your Perfect Furry Companion</h1>
      <p className="mb-8 text-lg">Browse our adorable dogs available for adoption and give them a forever home. <span className="italic">Refresh to see different dogs!</span></p>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading adorable dogs...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <div key={dog.id} className="border rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={dog.image_url} 
                    alt={dog.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{dog.name}</h2>
                  <p className="text-gray-700 mb-2">{dog.breed}</p>
                  {dog.age && <p className="text-gray-600 text-sm">{dog.age}</p>}
                  <div className="flex justify-between items-center mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      dog.status === 'available' ? 'bg-green-100 text-green-800' :
                      dog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dog.status.charAt(0).toUpperCase() + dog.status.slice(1)}
                    </span>
                    <Link 
                      href={`/dogs/${dog.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {dogs.length > 0 && (
            <p className="text-center text-gray-600 mt-6">
              Showing {dogs.length} random dogs. Refresh for a new selection!
            </p>
          )}
        </>
      )}
      
      {!loading && dogs.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg mb-4">No dogs found in the database.</p>
          <Link href="/admin" className="text-blue-500 hover:underline">
            Add some through the admin panel →
          </Link>
        </div>
      )}
      
    
    </div>
  );
}