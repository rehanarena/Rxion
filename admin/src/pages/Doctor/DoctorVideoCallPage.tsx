// admin/src/pages/DoctorVideoCallPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import DoctorVideoCall from '../../components/DoctorVideoCall';

const DoctorVideoCallPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  return (
    <div>
      <h1>Doctor - Video Call</h1>
      {appointmentId ? (
        <DoctorVideoCall roomId={appointmentId} />
      ) : (
        <p>Invalid appointment.</p>
      )}
    </div>
  );
};

export default DoctorVideoCallPage;
