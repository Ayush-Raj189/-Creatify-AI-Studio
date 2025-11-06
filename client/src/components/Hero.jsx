import React, { use } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Hero = () => {
  const navigate = useNavigate()
  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'  >
      <div className='text-center mb-6'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mx-auto leading-[1.2]'>Create Amazing Content <br />  with
          <span className='text-primary'> AI Tools</span></h1>
        <p className='mt-4 max-w-xs sm:max-w-lg 2xl:max-w-xl m-auto max-sm:text-xs text-gray-600'>Write articles, generate images, enhance your workflow, and more with our powerful AI solutions.</p>
      </div>

      <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs'>
        <button onClick={() => navigate('/ai')} className='bg-primary text-white px-10 py-3 rounded-lg font-medium hover:scale-102 active:scale-95 transition cursor-pointer'>Start Creating Now</button>

        <button className='bg-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer'>Watch Demo</button>
      </div>


      <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600'>
        <img src={assets.user_group} alt="Hero Image" className='h-8' /> Trusted by over 1000+ companies worldwide
      </div>

    </div>
  )

}
export default Hero