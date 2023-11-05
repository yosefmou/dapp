import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-4 lg:p-24">
      <div className='flex items-center justify-center w-full px-8 py-8 mb-10 bg-white mt-14 header lg:w-96'>
        <a href='/dapp' className='text-4xl font-bold text-center uppercase text-[#FFAA13]'>LAUNCH LOTTOGOLD DAPP</a>
      </div>
      <div className='flex flex-col items-center justify-around'>
        <div className='flex px-8 py-8 mb-10 bg-white mt-14 header'>
          <h1 className='text-4xl font-bold uppercase text-[#FFAA13]'>Requirements</h1>
        </div>
        <ol className='w-full p-8 text-left bg-white header'>
          <li className='mb-2 text-[#FFAA13] text-2xl'><strong>[1] Ticket Entry: You need to hold at least 0.25% Tokens for [1] Ticket.</strong></li>
          <li className='mb-2 text-[#FFAA13] text-2xl'><strong>[2] Ticket Entry: You need to hold at least 0.5% Tokens for [2] Tickets.</strong></li>
          <li className='mb-2 text-[#FFAA13] text-2xl'><strong>[3] Ticket Entry: You need to hold at least 1% Tokens for [3] Tickets.</strong></li>
        </ol>
      </div>
    </main>
  )
}