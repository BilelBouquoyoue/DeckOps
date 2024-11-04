import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, Clock, Loader, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import StatCard from './StatCard';

const ADMIN_USERNAME = btoa('Eeventei');
const ADMIN_PASSWORD = btoa('Tokitobashi6742');

interface VisitorStats {
  daily: number;
  monthly: number;
  yearly: number;
  lastUpdated: string;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<VisitorStats>({
    daily: 0,
    monthly: 0,
    yearly: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const updateVisitorStats = async () => {
      try {
        if (!db) {
          setInitError('Firebase not initialized properly');
          setLoading(false);
          return;
        }

        const statsRef = doc(db, 'statistics', 'visitors');
        const statsDoc = await getDoc(statsRef);
        
        if (!statsDoc.exists()) {
          const initialStats = {
            daily: 1,
            monthly: 1,
            yearly: 1,
            lastUpdated: new Date().toISOString()
          };
          await setDoc(statsRef, initialStats);
          setStats(initialStats);
        } else {
          const currentStats = statsDoc.data() as VisitorStats;
          const lastUpdate = new Date(currentStats.lastUpdated);
          const now = new Date();

          const needsDailyReset = lastUpdate.getDate() !== now.getDate();
          const needsMonthlyReset = lastUpdate.getMonth() !== now.getMonth();
          const needsYearlyReset = lastUpdate.getFullYear() !== now.getFullYear();

          if (needsDailyReset || needsMonthlyReset || needsYearlyReset) {
            const updates: Partial<VisitorStats> = {
              lastUpdated: now.toISOString()
            };

            if (needsDailyReset) updates.daily = 1;
            if (needsMonthlyReset) updates.monthly = 1;
            if (needsYearlyReset) updates.yearly = 1;

            await updateDoc(statsRef, {
              ...updates,
              daily: needsDailyReset ? 1 : increment(1),
              monthly: needsMonthlyReset ? 1 : increment(1),
              yearly: needsYearlyReset ? 1 : increment(1),
            });

            const updatedDoc = await getDoc(statsRef);
            setStats(updatedDoc.data() as VisitorStats);
          } else {
            await updateDoc(statsRef, {
              daily: increment(1),
              monthly: increment(1),
              yearly: increment(1),
              lastUpdated: now.toISOString()
            });
            
            const updatedDoc = await getDoc(statsRef);
            setStats(updatedDoc.data() as VisitorStats);
          }
        }
      } catch (err) {
        console.error('Error updating visitor stats:', err);
        setError('Failed to update visitor statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      updateVisitorStats();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (btoa(username) === ADMIN_USERNAME && btoa(password) === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid credentials');
    }
  };

  if (initError) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center gap-3 text-red-600">
          <AlertCircle size={24} />
          <p>{initError}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="card p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold">Admin Authentication</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader className="animate-spin" size={24} />
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} className="text-blue-600" />
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      </div>

      {error ? (
        <div className="text-red-600 flex items-center gap-2 mb-6">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Daily Visitors"
            value={stats.daily}
            className="bg-blue-50"
            icon={<Clock className="text-blue-600" size={24} />}
          />
          <StatCard
            label="Monthly Visitors"
            value={stats.monthly}
            className="bg-green-50"
            icon={<Calendar className="text-green-600" size={24} />}
          />
          <StatCard
            label="Yearly Visitors"
            value={stats.yearly}
            className="bg-purple-50"
            icon={<Users className="text-purple-600" size={24} />}
          />
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Last Updated: {new Date(stats.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}