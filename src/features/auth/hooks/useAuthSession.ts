import { useContext } from 'react';
import { AuthSessionContext } from '../context/AuthSessionContext';

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession debe usarse dentro de AuthSessionProvider');
  }
  return context;
};
