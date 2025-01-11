import { useContext, useEffect } from "react"
import { AdminContext } from "../../context/AdminContext"

const AllDoctors = () => {
    const {doctors,aToken,getAllDoctors,changeAvailability} = useContext(AdminContext)!;

    useEffect(()=>{
        if (aToken) {
            getAllDoctors()
        }
    },[aToken])
  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {
            doctors.map((item,index)=>(
                <div className="group border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer" key={index}>
                    <img className="bg-indigo-50 group-hover:bg-primary transition-all duration-500" src={item.image} alt="" />
                    <div className="p-4">
                        <p className=" text-neutral-800 text-lg font-semibold">{item.name}</p>
                        <p className="text-zinc-600 text-sm">{item.speciality}</p>
                        <div>
                            <input  onChange={()=>changeAvailability(item._id)} className="mt-2 flex items-center gap-1 text-sm" type="checkbox" checked={item.available}  />
                            <p className="text-sm text-gray-700">Available</p>
                            </div>
                        </div>
                    </div>
            ))
        }
      </div>
    </div>
  )
}

export default AllDoctors
