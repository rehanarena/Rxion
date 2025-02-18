import Banner from "../components/Banner"
import Header from "../components/Header"
import SpecialityMenu from "../components/SpecialityMenu"
import TopDoctors from "../components/TopDoctors"

const Home = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <SpecialityMenu />
        <TopDoctors />
        <Banner />
      </main>
    </div>
  )
}

export default Home