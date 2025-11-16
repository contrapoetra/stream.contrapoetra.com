import {createContext, useState} from 'react';

const DarkModeContext = createContext({darkMode: false, switchDarkMode: () => {}});

const DarkModeProvider = ({ children }: {children: React.ReactNode}) => {
  const [darkMode, setDarkMode] = useState(false);

  const switchDarkMode = () => {
    setDarkMode(darkMode ? false : true);
  };

  return (
    <DarkModeContext.Provider value={{darkMode, switchDarkMode}}>
      {children}
    </DarkModeContext.Provider>
  );
};

export { DarkModeContext, DarkModeProvider };
