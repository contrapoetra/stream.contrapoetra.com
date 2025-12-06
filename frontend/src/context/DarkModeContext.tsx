import {createContext, useState, useEffect} from 'react';

const DarkModeContext = createContext({darkMode: false, switchDarkMode: () => {}});

const DarkModeProvider = ({ children }: {children: React.ReactNode}) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const switchDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <DarkModeContext.Provider value={{darkMode, switchDarkMode}}>
      {children}
    </DarkModeContext.Provider>
  );
};

export { DarkModeContext, DarkModeProvider };
