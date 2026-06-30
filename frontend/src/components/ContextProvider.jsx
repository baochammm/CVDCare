import { createContext } from "react";
import React from "react";

export const userContext = createContext();

export const ContextProvider = ({ children }) => {
    const role = 'admin';
    const isAuthenticated = true;
    return (
        <userContext.Provider value={{ role, isAuthenticated }}>
            {children}
        </userContext.Provider>
    );
}

 export default ContextProvider;