import React, {useContext} from "react";
import { Navigate } from "react-router-dom";
import { userContext } from "./ContextProvider";

const ProtectedRoute = ({children, roles}) => {
    const {role, isAuthenticated} = useContext(userContext)
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
     if (roles && !roles.includes(role)) {
        return <Navigate to="/predict" />;
    }
    return children;
}  

export default ProtectedRoute;