"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import io from "socket.io-client"

const socket = io("http://localhost:4000") // Adjust to your backend URL

interface DoctorVideoCallProps {
  roomId: string
}

const DoctorVideoCall: React.FC<DoctorVideoCallProps> = ({ roomId }) => {
  const navigate = useNavigate() // Initialize navigation
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "in-call" | "declined" | "ended">("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pc = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    socket.emit("join-room", roomId)

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        initPeerConnection(stream)
      })
      .catch((err) => console.error("Error accessing media devices", err))

    // Listen for ICE candidates from the patient
    socket.on("ice-candidate", async (candidate) => {
      try {
        if (candidate && pc.current) {
          await pc.current.addIceCandidate(candidate)
        }
      } catch (err) {
        console.error(err)
      }
    })

    // Listen for answer from patient
    socket.on("answer-made", async (data) => {
      if (pc.current) {
        await pc.current.setRemoteDescription(data.signalData)
        setCallStatus("in-call")

        // Start call timer
        startCallTimer()
      }
    })

    // Listen for call rejection
    socket.on("call-declined", () => {
      setCallStatus("declined")
      alert("Call was declined by the patient.")
      endCall()
    })

    // Listen for call end
    socket.on("call-ended", () => {
      setCallStatus("ended")
      alert("Call has been ended.")
      endCall()
    })

    return () => {
      socket.off("ice-candidate")
      socket.off("answer-made")
      socket.off("call-declined")
      socket.off("call-ended")

      // Clear timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [roomId])

  const startCallTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setCallDuration(0)
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const initPeerConnection = (stream: MediaStream) => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
    stream.getTracks().forEach((track) => pc.current?.addTrack(track, stream))

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { room: roomId, candidate: event.candidate })
      }
    }
  }

  const callPatient = async () => {
    if (!pc.current) return
    setCallStatus("calling")
    const offer = await pc.current.createOffer()
    await pc.current.setLocalDescription(offer)
    socket.emit("call-user", { room: roomId, signalData: offer, from: socket.id })
  }

  const endCall = () => {
    if (pc.current) {
      pc.current.close()
      pc.current = null
    }
    socket.emit("end-call", { room: roomId })
    setCallStatus("ended")

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    navigate("/doctor-appoinments") // Adjust the route path if needed
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-4 text-white">
          <h2 className="text-xl font-semibold">
            {callStatus === "in-call" ? "Active Consultation" : "Doctor Consultation Room"}
          </h2>
          <p className="text-sm opacity-80">Room ID: {roomId}</p>
        </div>

        {/* Call Status Area */}
        {callStatus === "idle" && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800">Ready to start consultation</h3>
            <p className="text-gray-500 text-center max-w-md">
              Your patient is waiting in the virtual room. Start the call when you're ready.
            </p>
            <button
              onClick={callPatient}
              className="mt-4 px-8 py-3 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Patient
            </button>
          </div>
        )}

        {/* Calling Status */}
        {callStatus === "calling" && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800">Calling patient...</h3>
            <p className="text-gray-500 text-center">Waiting for the patient to accept your call</p>

            <button
              onClick={endCall}
              className="mt-4 px-6 py-3 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Call
            </button>
          </div>
        )}

        {/* Call Declined or Ended Status */}
        {(callStatus === "declined" || callStatus === "ended") && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-800">
              Call {callStatus === "declined" ? "declined by patient" : "ended"}
            </h3>
            <p className="text-gray-500 text-center">
              {callStatus === "declined"
                ? "The patient has declined your call request."
                : "The consultation has ended."}
            </p>

            <button
              onClick={() => navigate("/doctor-appoinments")}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                />
              </svg>
              Return to Appointments
            </button>
          </div>
        )}

        {/* Active Call UI */}
        {callStatus === "in-call" && (
          <div className="p-4">
            <div className="relative">
              {/* Main Video (Patient) */}
              <div className="w-full bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                  poster="/placeholder.svg?height=480&width=640"
                />
              </div>

              {/* Self Video (Doctor) */}
              <div className="absolute bottom-4 right-4 w-1/4 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Call Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${isMuted ? "bg-red-100 text-red-500" : "bg-gray-200 text-gray-700"} hover:bg-opacity-80 transition-colors focus:outline-none`}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${isVideoOff ? "bg-red-100 text-red-500" : "bg-gray-200 text-gray-700"} hover:bg-opacity-80 transition-colors focus:outline-none`}
                aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={endCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="End call"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                  />
                </svg>
                End Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call Information */}
      {callStatus === "in-call" && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md w-full max-w-4xl">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Call Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Connection: Stable</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-gray-600">Call duration: {formatTime(callDuration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Patient Notes (Only visible during call) */}
      {callStatus === "in-call" && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md w-full max-w-4xl">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Patient Notes</h3>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            placeholder="Add consultation notes here..."
            rows={4}
          ></textarea>
        </div>
      )}
    </div>
  )
}

export default DoctorVideoCall

