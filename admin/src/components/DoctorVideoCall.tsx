"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import io from "socket.io-client"
import { Phone, X, Mic, MicOff, Video, VideoOff, ArrowLeft, User, Clock, Wifi } from "lucide-react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"? import.meta.env.VITE_PRODUCTION_URL_BACKEND: import.meta.env.VITE_BACKEND_URL
const socket = io (backendUrl)

interface DoctorVideoCallProps {
  roomId: string
}

const DoctorVideoCall: React.FC<DoctorVideoCallProps> = ({ roomId }) => {
  const navigate = useNavigate()
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "in-call" | "declined" | "ended">("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pc = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  // Create a queue to store ICE candidates arriving before remoteDescription is set
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([])

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

    socket.on("ice-candidate", async (candidate) => {
      if (candidate && pc.current) {
        if (pc.current.remoteDescription) {
          try {
            await pc.current.addIceCandidate(candidate)
          } catch (err) {
            console.error("Error adding ICE candidate:", err)
          }
        } else {
          console.warn("Remote description is not set. Queue candidate for later addition.")
          pendingCandidates.current.push(candidate)
        }
      }
    })

    socket.on("answer-made", async (data) => {
      console.log("Answer made received:", data.signalData)
      if (pc.current) {
        await pc.current.setRemoteDescription(data.signalData)
        // Process queued ICE candidates once remote description is set
        for (const candidate of pendingCandidates.current) {
          try {
            await pc.current.addIceCandidate(candidate)
          } catch (err) {
            console.error("Error adding queued ICE candidate:", err)
          }
        }
        pendingCandidates.current = []
        setCallStatus("in-call")
        startCallTimer()
      }
    })

    socket.on("call-declined", () => {
      setCallStatus("declined")
      toast.error("Call was declined by the patient.")
      endCall()
    })
    
    socket.on("call-ended", () => {
      setCallStatus("ended")
      toast.info("Call has been ended.")
      endCall()
    })
    

    return () => {
      socket.off("ice-candidate")
      socket.off("answer-made")
      socket.off("call-declined")
      socket.off("call-ended")

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
  
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
    }
  
    socket.emit("end-call", { room: roomId })
    setCallStatus("ended")
  
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  
    navigate("/doctor-appoinments")
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
      <ToastContainer position="top-right" autoClose={5000} />
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <h2 className="text-xl font-semibold">
            {callStatus === "in-call" ? "Active Consultation" : "Doctor Consultation Room"}
          </h2>
          <p className="text-sm opacity-80">Room ID: {roomId}</p>
        </div>
        {callStatus === "idle" && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800">Ready to start consultation</h3>
            <p className="text-gray-500 text-center max-w-md">
              Your patient is waiting in the virtual room. Start the call when you're ready.
            </p>
            <button
              onClick={callPatient}
              className="mt-4 px-8 py-3 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Patient
            </button>
          </div>
        )}

        {callStatus === "calling" && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
              <Phone className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800">Calling patient...</h3>
            <p className="text-gray-500 text-center">Waiting for the patient to accept your call</p>

            <button
              onClick={endCall}
              className="mt-4 px-6 py-3 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel Call
            </button>
          </div>
        )}

        {(callStatus === "declined" || callStatus === "ended") && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <X className="h-12 w-12 text-gray-500" />
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
              className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
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

            <div className="mt-6 flex justify-center space-x-6">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted
                    ? "bg-red-100 text-red-500 border border-red-200"
                    : "bg-indigo-100 text-indigo-600 border border-indigo-200"
                } hover:bg-opacity-80 transition-colors focus:outline-none`}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>

              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full ${
                  isVideoOff
                    ? "bg-red-100 text-red-500 border border-red-200"
                    : "bg-indigo-100 text-indigo-600 border border-indigo-200"
                } hover:bg-opacity-80 transition-colors focus:outline-none`}
                aria-label={isVideoOff ? "Turn on camera" : "Turn off camera"}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </button>

              <button
                onClick={endCall}
                className="px-6 py-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="End call"
              >
                <Phone className="h-5 w-5 mr-2" />
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
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mr-3">
                <Wifi className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Connection: Stable</span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 mr-3">
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-600">Call duration: {formatTime(callDuration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorVideoCall

