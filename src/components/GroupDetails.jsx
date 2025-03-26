useEffect(() => {
  const handleStorageChange = () => {
    const savedGrupos = localStorage.getItem('grupos');
    if (savedGrupos) {
      const parsedGrupos = JSON.parse(savedGrupos);
      setGrupos(parsedGrupos);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);