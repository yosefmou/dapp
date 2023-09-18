import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-4 lg:p-24">
      <div className='flex items-center justify-center mt-14 bg-[#e97039] header px-8 py-8 mb-10 w-full lg:w-96'>
        <a href='/dapp' className='text-4xl font-bold text-center uppercase'>TO THE DAPP</a>
      </div>
      <div className='flex flex-col items-center justify-around'>
        <div className='flex mt-14 bg-[#e97039] header px-8 py-8 mb-10'>
          <h1 className='text-4xl font-bold uppercase'>Rules</h1>
        </div>
        <ol className='w-full text-left bg-[#e97039] header p-8'>
          <li className='mb-2'>1. <strong>One Bet Per Match:</strong> Users are allowed to place a single bet per match.</li>
          <li className='mb-2'>2. <strong>Minimum Bet Amount:</strong> The minimum bet amount is 0.01 ETH.</li>
          <li className='mb-2'>3. <strong>Maximum Bet Amount:</strong> The maximum bet amount is 0.1 ETH.</li>
          <li className='mb-2'>4. <strong>Minimum SS Token Requirement:</strong> Users must hold a minimum amount of SS tokens to place a bet.</li>
          <li className='mb-2'>5. <strong>Bets in ETH:</strong> All bets are to be placed in Ethereum (ETH).</li>
          <li className='mb-2'>6. <strong>Winnings Distribution:</strong> Winnings will be distributed once the match concludes.</li>
        </ol>
      </div>
    </main>
  )
}