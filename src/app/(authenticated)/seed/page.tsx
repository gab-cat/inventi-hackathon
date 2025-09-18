'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const seedDatabase = useMutation(api.seeders.seed.seedDatabase);

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const result = await seedDatabase({});
      setResult(`Database seeded successfully! Created:
- ${result.properties} properties
- ${result.units} units  
- ${result.users} users
- ${result.maintenanceRequests} maintenance requests`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Seed Database</h1>

      <div className='mb-4'>
        <p className='mb-2'>This will create sample data for testing:</p>
        <ul className='list-disc list-inside mb-4'>
          <li>2 properties (Sunset Apartments, Downtown Plaza)</li>
          <li>10 units across the properties</li>
          <li>3 tenant users</li>
          <li>2 field technician users</li>
          <li>10 maintenance requests with various statuses</li>
        </ul>
        <p className='text-sm text-gray-600 mb-4'>
          <strong>Note:</strong> This will use your existing manager user account and create realistic sample data with
          proper relationships.
        </p>
      </div>

      <button
        onClick={handleSeed}
        disabled={isSeeding}
        className='bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded'
      >
        {isSeeding ? 'Seeding Database...' : 'Seed Database'}
      </button>

      {result && (
        <div
          className={`mt-4 p-4 rounded ${result.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          <pre className='whitespace-pre-wrap'>{result}</pre>
        </div>
      )}
    </div>
  );
}
