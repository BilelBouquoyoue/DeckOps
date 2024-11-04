import React, { useRef, useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import type { Card } from '../types/deck';
import { parseYDKFile, YDKParseError } from '../utils/ydkParser';
import ErrorMessage from './ErrorMessage';

interface YDKImportProps {
  onImport: (cards: Card[]) => void;
}

export default function YDKImport({ onImport }: YDKImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    setShowSuccess(false);

    try {
      if (!file.name.endsWith('.ydk')) {
        throw new YDKParseError('Please select a valid YDK file');
      }

      const cards = await parseYDKFile(file);
      onImport(cards);
      setShowSuccess(true);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const message = error instanceof YDKParseError 
        ? error.message 
        : 'An unexpected error occurred while importing the deck';
      
      setError(message);
      console.error('YDK Import Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept=".ydk"
        onChange={handleFileSelect}
        className="hidden"
        ref={fileInputRef}
      />
      <button
        onClick={() => {
          setError(null);
          setShowSuccess(false);
          fileInputRef.current?.click();
        }}
        className="btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Upload size={20} />
        )}
        {isLoading ? 'Importing...' : 'Import YDK File'}
      </button>
      
      {showSuccess && (
        <div className="flex items-center gap-2 p-3 text-sm text-blue-700 bg-blue-50 rounded-lg border border-blue-100">
          <AlertCircle size={16} className="flex-shrink-0" />
          <p className="flex-1">
            Deck imported successfully! Remember to set each card's role (Starter, Neutral, Handtrap, or Brick) for accurate deck analysis.
          </p>
        </div>
      )}
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
}