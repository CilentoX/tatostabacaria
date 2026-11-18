import { useEffect, useState } from 'react';
import { api, type Settings } from '../lib/api';

const DEFAULT_SETTINGS: Settings = {
    instagram_url: 'https://www.instagram.com/tato.tabacaria_',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}