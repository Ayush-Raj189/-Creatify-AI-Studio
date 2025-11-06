import React, { useEffect, useState } from 'react'
import { dummyCreationData } from '../assets/assets';
import { Gem, Sparkles } from 'lucide-react';
import { Protect } from '@clerk/clerk-react';
import CreationItem from '../components/CreationItem';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creation, setCreation] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();

  const getDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setCreation(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className=' h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        {/* {// Total Creations Card} */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm'>

          <div className=' text-slate-600 '>
            <p className='text-sm font-semibold'>Total Creations</p>
            <h2 className='font-semibold text-xl'>{creation.length} </h2>
          </div>

          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white' />
          </div>

        </div>

        {/* {Active Plan Card*/}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200 shadow-sm'>

          <div className=' text-slate-600 '>
            <p className='text-sm font-semibold'>Active Plan</p>
            <h2 className='font-semibold text-xl'><Protect plan='premium' fallback='Free'> Premium </Protect></h2>
          </div>

          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white' />
          </div>

        </div>
      </div>

      {
        loading ? (
          <div className='flex justify-center items-center h-3/4'>
            <div className='w-11 h-11 rounded-full border-3 border-t-transparent border-purple-500 animate-spin'></div>
          </div>
        ) : (
          <div className='spae-y-3'>
            <p className='mt-6 mb-4'> Recent Creations</p>
            {
              creation.map((item) => <CreationItem key={item.id} item={item} />)
            }
          </div >

        )
      }


    </div >
  )
}

export default Dashboard