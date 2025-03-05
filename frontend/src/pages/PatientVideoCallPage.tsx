// frontend/src/pages/PatientVideoCallPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import PatientVideoCall from '../components/PatientVideoCall';

const PatientVideoCallPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  return (
    <div>
      <h1>Patient - Video Call</h1>
      {appointmentId ? (
        <PatientVideoCall roomId={appointmentId} />
      ) : (
        <p>Invalid appointment.</p>
      )}
    </div>
  );
};

export default PatientVideoCallPage;
