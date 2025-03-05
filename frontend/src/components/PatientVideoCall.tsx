import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); 

interface PatientVideoCallProps {
  roomId: string;
}

const PatientVideoCall: React.FC<PatientVideoCallProps> = ({ roomId }) => {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit('join-room', roomId);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        initPeerConnection(stream);
      })
      .catch(err => console.error('Error accessing media devices', err));

    // Listen for incoming call from doctor
    socket.on('call-made', (data) => {
      if (!callAccepted) {
        console.log("Incoming call:", data);
        setIncomingCall(data);
      }
    });

    // Listen for ICE candidates from doctor
    socket.on('ice-candidate', async (candidate) => {
      try {
        if (candidate && pc.current) {
          await pc.current.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Listen for call end
    socket.on('call-ended', () => {
      alert('Call has been ended.');
      endCall();
    });

    return () => {
      socket.off('call-made');
      socket.off('ice-candidate');
      socket.off('call-ended');
    }
  }, [roomId, callAccepted]);

  const initPeerConnection = (stream: MediaStream) => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    stream.getTracks().forEach(track => pc.current?.addTrack(track, stream));

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { room: roomId, candidate: event.candidate });
      }
    };
  };

  const acceptCall = async () => {
    console.log("acceptCall() triggered");
    setCallAccepted(true);
    if (!incomingCall || !pc.current){
      return
    }
    await pc.current.setRemoteDescription(incomingCall.signalData);

    const answer = await pc.current.createAnswer();

    await pc.current.setLocalDescription(answer);

    socket.emit('make-answer', { room: roomId, signalData: answer, from: socket.id });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    socket.emit('reject-call', { room: roomId });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    socket.emit('end-call', { room: roomId });
    setCallAccepted(false);
    navigate("/my-appointments");
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-4 text-white">
          <h2 className="text-xl font-semibold">
            {callAccepted ? 'Active Consultation' : 'Virtual Consultation Room'}
          </h2>
          <p className="text-sm opacity-80">Room ID: {roomId}</p>
        </div>

        {/* Call Status Area */}
        {!callAccepted && !incomingCall && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800">Waiting for doctor to join...</h3>
            <p className="text-gray-500 text-center max-w-md">
              Your doctor will connect with you shortly. Please ensure your camera and microphone are working properly.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <p className="text-sm text-gray-600">You're ready to connect</p>
              </div>
            </div>
          </div>
        )}

        {/* Incoming Call Notification */}
        {!callAccepted && incomingCall && (
          <div className="p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Doctor is calling you</h3>
            <p className="text-gray-500 mb-6 text-center">Your doctor is ready for your consultation</p>
            
            <div className="flex space-x-4">
              <button 
                onClick={acceptCall}
                className="px-6 py-3 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Accept
              </button>
              <button 
                onClick={rejectCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Active Call UI */}
        {callAccepted && (
          <div className="p-4">
            <div className="relative">
              {/* Main Video (Doctor) */}
              <div className="w-full bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  className="w-full h-full object-cover" 
                  poster="/placeholder.svg?height=480&width=640"
                />
              </div>
              
              {/* Self Video (Patient) */}
              <div className="absolute bottom-4 right-4 w-1/4 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>

            {/* Call Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              <button 
                onClick={toggleMute} 
                className={`p-4 rounded-full ${isMuted ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80 transition-colors focus:outline-none`}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={toggleVideo} 
                className={`p-4 rounded-full ${isVideoOff ? 'bg-red-100 text-red-500' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80 transition-colors focus:outline-none`}
                aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={endCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="End call"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
                End Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call Information */}
      {callAccepted && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md w-full max-w-4xl">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Call Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Connection: Stable</span>
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600" id="call-timer">Call duration: 00:00</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientVideoCall;
