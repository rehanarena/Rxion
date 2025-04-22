"use client"

import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import io from "socket.io-client"
import { Phone, X, Mic, MicOff, Video, VideoOff, Clock, Wifi, MonitorSmartphone } from "lucide-react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const backendUrl = import.meta.env.VITE_NODE_ENV==="PRODUCTION"
  ? import.meta.env.VITE_PRODUCTION_URL_BACKEND
  : import.meta.env.VITE_BACKEND_URL
const socket = io(backendUrl)

interface PatientVideoCallProps {
  roomId: string
}

interface IncomingCallData {
  room: string
  signalData: RTCSessionDescriptionInit
  from: string
}

const PatientVideoCall: React.FC<PatientVideoCallProps> = ({ roomId }) => {
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null)
  const [callAccepted, setCallAccepted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const pc = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const pendingCandidates = useRef<RTCIceCandidateInit[]>([])

  const navigate = useNavigate()

  useEffect(() => {
    socket.emit("join-room", roomId)

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("Local stream captured:", stream)
        localStreamRef.current = stream
        initPeerConnection(stream)
      })
      .catch((err) => console.error("Error accessing media devices", err))

    socket.on("call-made", (data) => {
      if (!callAccepted) {
        console.log("Incoming call:", data)
        setIncomingCall(data)
      }
    })

    socket.on("ice-candidate", async (candidate) => {
      console.log("Received ICE candidate:", candidate)
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

    socket.on("call-ended", () => {
      toast.info("Call has been ended.")
      endCall()
    })

    return () => {
      socket.off("call-made")
      socket.off("ice-candidate")
      socket.off("call-ended")

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [roomId])

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [callAccepted])

  const startCallTimer = () => {
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
      console.log("Remote stream received:", event.streams)
      if (event.streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate)
        socket.emit("ice-candidate", { room: roomId, candidate: event.candidate })
      }
    }
  }

  const acceptCall = async () => {
    console.log("acceptCall() triggered")
    if (callAccepted) return
    setCallAccepted(true)
    if (!incomingCall || !pc.current) return
    await pc.current.setRemoteDescription(incomingCall.signalData)
    for (const candidate of pendingCandidates.current) {
      try {
        await pc.current.addIceCandidate(candidate)
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err)
      }
    }
    pendingCandidates.current = []

    const answer = await pc.current.createAnswer()
    await pc.current.setLocalDescription(answer)

    socket.emit("make-answer", { room: roomId, signalData: answer, from: socket.id })
    setIncomingCall(null)
    startCallTimer()
  }

  const rejectCall = () => {
    socket.emit("reject-call", { room: roomId })
    setIncomingCall(null)
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
    setCallAccepted(false)
  
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  
    navigate("/my-appointments")
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
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
          <h2 className="text-xl font-semibold">
            {callAccepted ? "Active Consultation" : "Virtual Consultation Room"}
          </h2>
        </div>

        {/* Waiting / Idle UI */}
        {!callAccepted && !incomingCall && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center">
              <MonitorSmartphone className="h-12 w-12 text-violet-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-medium text-gray-800">Waiting for doctor to join...</h3>
            <p className="text-gray-500 text-center max-w-md">
              Your doctor will connect with you shortly. Please ensure your camera and microphone are working properly.
            </p>
            <div className="mt-4 p-4 bg-violet-50 rounded-lg border border-violet-100">
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
            <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-4 animate-pulse">
              <Phone className="h-10 w-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Doctor is calling you</h3>
            <p className="text-gray-500 mb-6 text-center">Your doctor is ready for your consultation</p>
            <div className="flex space-x-4">
              <button
                onClick={acceptCall}
                className="px-6 py-3 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                <Phone className="h-5 w-5 mr-2" />
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                <X className="h-5 w-5 mr-2" />
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
                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover" />
              </div>
            </div>
            {/* Call Controls */}
            <div className="mt-6 flex justify-center space-x-6">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted
                    ? "bg-red-100 text-red-500 border border-red-200"
                    : "bg-violet-100 text-violet-600 border border-violet-200"
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
                    : "bg-violet-100 text-violet-600 border border-violet-200"
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
      {callAccepted && (
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
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 mr-3">
                <Clock className="h-4 w-4 text-violet-600" />
              </div>
              <span className="text-sm text-gray-600">Call duration: {formatTime(callDuration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientVideoCall
