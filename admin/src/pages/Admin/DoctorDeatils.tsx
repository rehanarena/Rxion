"use client"

import { useState, useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import { AdminContext } from "../../context/AdminContext"
const DoctorDetails = () => {
  const { doctorId } = useParams<{ doctorId: string }>()
  const { getDoctorDetails } = useContext(AdminContext)!
  const [doctor, setDoctor] = useState<any>(null)

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) {
        return
      }
      const data = await getDoctorDetails(doctorId)
      setDoctor(data)
    }
    fetchDoctor()
  }, [doctorId, getDoctorDetails])

  if (!doctor)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Details</h1>
      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <p className="text-lg mb-2">
          <span className="font-semibold">Name:</span> {doctor.name}
        </p>
        <p className="text-lg mb-2">
          <span className="font-semibold">Speciality:</span> {doctor.speciality}
        </p>
        <p className="text-lg mb-2">
          <span className="font-semibold">Email:</span> {doctor.email}
        </p>
        <p className="text-lg mb-2">
          <span className="font-semibold">Fees:</span> {doctor.fees}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Experience:</span> {doctor.experience} years
        </p>
      </div>
    </div>
  )
}

export default DoctorDetails
