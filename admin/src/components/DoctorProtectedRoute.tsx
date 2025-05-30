import React, { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { DoctorContext } from '../context/DoctorContext';
import { DoctorContextType } from '../Interfaces/Doctor';

interface DoctorProtectedRouteProps {
  children: ReactNode;
}

const DoctorProtectedRoute: React.FC<DoctorProtectedRouteProps> = ({ children }) => {
  const { dToken } = useContext(DoctorContext) as DoctorContextType;
  if (!dToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default DoctorProtectedRoute;
