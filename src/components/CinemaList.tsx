import { useState } from 'react';
import type { Cinema } from '../types';

interface CinemaListProps {
  cinemas: Cinema[];
  onAdd: (name: string, url: string) => void;
  onUpdate: (id: string, name: string, url: string) => void;
  onRemove: (id: string) => void;
}

function isValidAlloCineUrl(url: string): boolean {
  return url.startsWith('https://www.allocine.fr/seance/salle_gen_csalle=C') && 
         url.endsWith('.html');
}

export function CinemaList({ cinemas, onAdd, onUpdate, onRemove }: CinemaListProps) {
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const handleAdd = () => {
    setError('');
    
    if (!newName.trim()) {
      setError('Veuillez entrer un nom pour le cinéma');
      return;
    }
    
    if (!newUrl.trim()) {
      setError('Veuillez entrer une URL AlloCiné');
      return;
    }
    
    if (!isValidAlloCineUrl(newUrl.trim())) {
      setError('L\'URL doit être au format https://www.allocine.fr/seance/salle_gen_csalle=CXXXX.html');
      return;
    }
    
    onAdd(newName.trim(), newUrl.trim());
    setNewName('');
    setNewUrl('');
  };

  const handleEdit = (cinema: Cinema) => {
    setEditingId(cinema.id);
    setEditName(cinema.name);
    setEditUrl(cinema.url);
    setError('');
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      setError('Le nom ne peut pas être vide');
      return;
    }
    
    if (!isValidAlloCineUrl(editUrl.trim())) {
      setError('L\'URL doit être au format https://www.allocine.fr/seance/salle_gen_csalle=CXXXX.html');
      return;
    }
    
    if (editingId) {
      onUpdate(editingId, editName.trim(), editUrl.trim());
      setEditingId(null);
      setError('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditUrl('');
    setError('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Mes cinémas</h2>
      
      {cinemas.length === 0 ? (
        <div className="card-brutal bg-gray-50 border-dashed">
          <p className="text-gray-500 text-center py-4">
            Aucun cinéma configuré. Ajoutez votre premier cinéma ci-dessous.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cinemas.map((cinema) => (
            <div key={cinema.id} className="card-brutal p-4">
              {editingId === cinema.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nom du cinéma"
                    className="input-brutal"
                  />
                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="URL AlloCiné"
                    className="input-brutal text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="btn-brutal text-sm py-2 px-4">
                      Enregistrer
                    </button>
                    <button onClick={handleCancelEdit} className="btn-brutal-secondary text-sm py-2 px-4">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{cinema.name}</h3>
                    <a 
                      href={cinema.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-coral transition-colors truncate block"
                    >
                      {cinema.url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(cinema)}
                      className="p-2 hover:bg-gray-100 border-2 border-dark transition-colors"
                      title="Modifier"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRemove(cinema.id)}
                      className="p-2 hover:bg-red-50 border-2 border-dark text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card-brutal bg-gray-50">
        <h3 className="font-bold text-lg mb-4">Ajouter un cinéma</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du cinéma (ex: MK2 Bibliothèque)"
            className="input-brutal"
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://www.allocine.fr/seance/salle_gen_csalle=CXXXX.html"
            className="input-brutal text-sm"
          />
          {error && (
            <p className="text-red-600 text-sm font-medium bg-red-50 p-2 border-2 border-red-500">
              {error}
            </p>
          )}
          <button onClick={handleAdd} className="btn-brutal w-full">
            Ajouter le cinéma
          </button>
        </div>
      </div>
    </div>
  );
}
