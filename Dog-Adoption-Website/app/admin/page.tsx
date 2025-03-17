'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Dog } from '../../types/dogs';

export default function AdminPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [bulkAmount, setBulkAmount] = useState(5);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [supabase, setSupabase] = useState<any>(null);
  
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const client = createClient(supabaseUrl, supabaseKey);
        setSupabase(client);
      } else {
        setMessage({
          text: "Supabase environment variables are missing. Please check your configuration.",
          type: "error"
        });
      }
    }
  }, []);
  
 
  useEffect(() => {
    if (supabase) {
      fetchDogs();
    }
  }, [supabase]);
  
  async function fetchDogs() {
    if (!supabase) return;
    
    setTableLoading(true);
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setDogs(data || []);
    } catch (error: any) {
      console.error('Error fetching dogs:', error);
      setMessage({
        text: `Error loading dogs: ${error.message}`,
        type: 'error'
      });
    } finally {
      setTableLoading(false);
    }
  }
  
  async function generateRandomDog() {
    const names = ['Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Lucy', 'Buddy', 'Daisy', 'Rocky', 'Molly', 
                 'Bailey', 'Sadie', 'Lola', 'Tucker', 'Riley', 'Zoe', 'Jack', 'Stella', 'Oliver', 'Ruby'];
    const name = names[Math.floor(Math.random() * names.length)];

    const ages = ['Puppy (0-1 year)', '1-3 years', '4-7 years', '8+ years'];
    const age = ages[Math.floor(Math.random() * ages.length)];

    const descriptions = [
      'Playful and energetic. Loves to run and play fetch!',
      'Calm and gentle. Great with children and other pets.',
      'Loyal and protective. Makes an excellent companion.',
      'Smart and trainable. Learns commands quickly.',
      'Affectionate and loving. Enjoys cuddling on the couch.'
    ];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await response.json();
    const imageUrl = data.message;

    const urlParts = imageUrl.split('/');
    const breedPart = urlParts[4];
    const breed = breedPart.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return {
      name,
      breed,
      age,
      image_url: imageUrl,
      status: 'available' as const,
      description
    };
  }
  
  async function bulkAddRandomDogs() {
    if (!supabase) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const dogPromises = [];
      
      for (let i = 0; i < bulkAmount; i++) {
        dogPromises.push(generateRandomDog());
      }
      
      const randomDogs = await Promise.all(dogPromises);
      
      const { data, error } = await supabase
        .from('dogs')
        .insert(randomDogs)
        .select();

      if (error) throw error;

      setMessage({
        text: `Successfully added ${randomDogs.length} dogs to the database!`,
        type: 'success'
      });
      
      fetchDogs();
    } catch (error: any) {
      console.error('Error adding dogs:', error);
      setMessage({
        text: `Error adding dogs: ${error.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function updateDogStatus(id: string, newStatus: 'available' | 'pending' | 'adopted') {
    if (!supabase) return;
    
    try {
      const { error } = await supabase
        .from('dogs')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setDogs(dogs.map(dog => {
        if (dog.id === id) {
          return { ...dog, status: newStatus };
        }
        return dog;
      }));
      
      setMessage({
        text: `Status updated successfully`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error updating dog status:', error);
      setMessage({
        text: `Error updating status: ${error.message}`,
        type: 'error'
      });
    }
  }
  
  async function deleteDog(id: string) {
    if (!supabase) return;
    
    if (!confirm('Are you sure you want to delete this dog?')) return;
    
    try {
      const { error } = await supabase
        .from('dogs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setDogs(dogs.filter(dog => dog.id !== id));
      
      setMessage({
        text: `Dog deleted successfully!`,
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error deleting dog:', error);
      setMessage({
        text: `Error deleting dog: ${error.message}`,
        type: 'error'
      });
    }
  }
  
  function startEditing(dog: Dog) {
    setEditingDog({...dog});
  }
  
  function cancelEditing() {
    setEditingDog(null);
  }
  
  async function saveChanges() {
    if (!supabase || !editingDog) return;
    
    try {
      const { error } = await supabase
        .from('dogs')
        .update({
          name: editingDog.name,
          breed: editingDog.breed,
          age: editingDog.age,
          image_url: editingDog.image_url,
          status: editingDog.status,
          description: editingDog.description
        })
        .eq('id', editingDog.id);
        
      if (error) throw error;
      
      setDogs(dogs.map(dog => {
        if (dog.id === editingDog.id) {
          return editingDog;
        }
        return dog;
      }));
      
      setMessage({
        text: `Dog updated successfully!`,
        type: 'success'
      });
      
      setEditingDog(null);
    } catch (error: any) {
      console.error('Error updating dog:', error);
      setMessage({
        text: `Error updating dog: ${error.message}`,
        type: 'error'
      });
    }
  }
  
  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    if (!editingDog) return;
    
    const { name, value } = e.target;
    setEditingDog({
      ...editingDog,
      [name]: value
    });
  }

 
  if (!supabase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">Connecting to database...</p>
        </div>
        
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to Home
      </Link>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add new Dogs to the database</h2>
        <p className="mb-4">Quickly add multiple random dogs from the Dog API</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dogs to Add</label>
            <input
              type="number"
              min="1"
              max="20"
              value={bulkAmount}
              onChange={(e) => setBulkAmount(parseInt(e.target.value))}
              className="p-2 border rounded w-full"
            />
          </div>
          
          <button
            onClick={bulkAddRandomDogs}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-purple-300 self-end"
          >
            {loading ? `Adding` : `Add`}
          </button>
        </div>
      </div>

      {/* CRUD dog table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Dog Management</h2>
          <span className="text-gray-500">{dogs.length} total dogs</span>
        </div>
        
        {tableLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading dogs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dog
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No dogs found in the database. Add some using the bulk import feature above.
                    </td>
                  </tr>
                ) : (
                  dogs.map((dog) => (
                    <tr key={dog.id} className={editingDog?.id === dog.id ? 'bg-blue-50' : ''}>
                      {editingDog?.id === dog.id ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={dog.image_url}
                                alt={dog.name}
                                className="h-10 w-10 rounded-full object-cover mr-4"
                              />
                              <input
                                name="name"
                                value={editingDog.name}
                                onChange={handleEditChange}
                                className="p-1 border rounded w-full max-w-xs"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              name="breed"
                              value={editingDog.breed}
                              onChange={handleEditChange}
                              className="p-1 border rounded w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              name="age"
                              value={editingDog.age || ''}
                              onChange={handleEditChange}
                              className="p-1 border rounded w-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              name="status"
                              value={editingDog.status}
                              onChange={handleEditChange}
                              className="p-1 border rounded w-full"
                            >
                              <option value="available">Available</option>
                              <option value="pending">Pending</option>
                              <option value="adopted">Adopted</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={saveChanges}
                                className="text-green-600 hover:text-green-900"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={dog.image_url}
                                alt={dog.name}
                                className="h-10 w-10 rounded-full object-cover mr-4"
                              />
                              <div>
                                <div className="font-medium text-gray-900">{dog.name}</div>
                                <Link
                                  href={`/dogs/${dog.id}`}
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {dog.breed}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {dog.age || 'Not specified'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={dog.status}
                              onChange={(e) => updateDogStatus(dog.id, e.target.value as 'available' | 'pending' | 'adopted')}
                              className={`p-1 border rounded text-sm ${
                                dog.status === 'available' ? 'bg-green-100 border-green-300' :
                                dog.status === 'pending' ? 'bg-yellow-100 border-yellow-300' :
                                'bg-red-100 border-red-300'
                              }`}
                            >
                              <option value="available">Available</option>
                              <option value="pending">Pending</option>
                              <option value="adopted">Adopted</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => startEditing(dog)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteDog(dog.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}