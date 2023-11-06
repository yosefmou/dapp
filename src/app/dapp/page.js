'use client';
import { MetaMaskSDK } from '@metamask/sdk';
import Web3 from 'web3'
import { useState, useEffect } from 'react';
import bettingContract from '../../../blockchain/betting';
import randNums from './numbers.json';

const options = {
    dappMetadata: { name: "LottoGold DAPP", url: "https://lottogold.vercel.app/dapp" },
    preferDesktop: false
};

const MMSDK = new MetaMaskSDK(options);
const randomNumbers = randNums;

const lottogold = () => {
    const [errorMsg, setErrorMsg] = useState('')
    const [infoMsg, setInfoMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [walletBalance, setWalletBalance] = useState('')
    const [walletSSBalance, setWalletSSBalance] = useState('')
    const [walletSSBalanceTxt, setWalletSSBalanceTxt] = useState('')
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [walletConnectorText, setWalletConnectorText] = useState('Connect Wallet')
    const [owner, setOwner] = useState(null)
    const [tokenContract, setTokenContract] = useState(null)
    const [userEligableForTickets, setUserEligableForTickets] = useState(null)
    const [userWalletExists, setUserWalletExists] = useState(false)
    const [userRedeemedTickets, setUserRedeemedTickets] = useState([])
    const [winnerTicketNumber, setWinnerTicketNumber] = useState(null)
    const [jackpotBalance, setJackpotBalance] = useState(null)
    const [adminMsg, setAdminMsg] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0);


    useEffect(() => {
        if (address) getWalletBalanceHandler()
        if (address) getOwner()
        if (address) walletExists(address)
        if (address) checkEligibilityCount()
        if (userRedeemedTickets) showUserTickets()
        getWinnerTicket();


        const getJackpotBalanceHandler = async () => {
            console.log('getJackpotBalanceHandler')
            try {
                const provider = window.ethereum;
                const web3 = new Web3(provider);
                const jackpotBalance = await web3.eth.getBalance('0x311E31b7264522A04eC6DC5f127E71041820c9b0'); // Jackpot address
                const balanceInEth = web3.utils.fromWei(jackpotBalance, 'ether');
                const balanceInEth2Decimal = Math.round(balanceInEth * 100) / 100;
                const finalBalance = balanceInEth2Decimal.toString();
                setJackpotBalance(finalBalance);
            } catch (error) {
                console.log(error.message);
                setTimeout(() => {
                    setErrorMsg('');
                }, 20000);
            }
        };

        getJackpotBalanceHandler();

        // Set up an interval to call the function every few seconds (e.g., every 5 seconds)
        const intervalId = setInterval(() => {
            getJackpotBalanceHandler();
        }, 5000); // 5000 milliseconds = 5 seconds

        // Clean up the interval when the component unmounts
        return () => {
            clearInterval(intervalId);
        };
    },
        [tokenContract, address, userRedeemedTickets, jackpotBalance]
    );

    const getOwner = () => {
        try {
            const owner = "0x311E31b7264522A04eC6DC5f127E71041820c9b0";
            setOwner(owner)
        } catch (error) {
            console.log(error.message)
        }
    }

    const checkEligibilityCount = () => {
        const oneTicket = (0.25 / 100) * 1000;
        const twoTickets = (0.5 / 100) * 1000;
        const threeTickets = (1 / 100) * 1000;

        let eligibility = 0;

        if (Number(walletSSBalance) >= Number(oneTicket) && Number(walletSSBalance) < Number(twoTickets)) {
            eligibility = 1;
        } else if (Number(walletSSBalance) >= Number(twoTickets) && Number(walletSSBalance) < Number(threeTickets)) {
            eligibility = 2;
        } else if (Number(walletSSBalance) >= Number(threeTickets)) {
            eligibility = 3;
        }

        setUserEligableForTickets(eligibility);
    }

    const checkEligibility = () => {
        try {
            const oneTicket = (0.25 / 100) * 1000
            const twoTickets = (0.5 / 100) * 1000
            const threeTickets = (1 / 100) * 1000
            if (Number(walletSSBalance) >= Number(oneTicket) && Number(walletSSBalance) < Number(twoTickets)) {
                setInfoMsg(<span className='p-2 bg-white'>you are eligable for <span className='text-8xl'>1</span> ticket</span>);
                const element = document.querySelector('#assignTicket');
                element.classList.remove('hidden');
            } else if (Number(walletSSBalance) >= Number(twoTickets) && Number(walletSSBalance) < Number(threeTickets)) {
                setInfoMsg(<span className='p-2 bg-white'>you are eligable for <span className='text-8xl'>2</span> tickets</span>);
                const element = document.querySelector('#assignTicket');
                element.classList.remove('hidden');
            } else if (Number(walletSSBalance) >= Number(threeTickets)) {
                setInfoMsg(<span className='p-2 bg-white'>you are eligable for <span className='text-8xl'>3</span> tickets</span>);
                const element = document.querySelector('#assignTicket');
                element.classList.remove('hidden');
            } else {
                setInfoMsg(<span className='p-2 text-center bg-white'>you are not eligable for any tickets <br /> <span className='text-xl'>For more info check the DAPP guide</span> </span>);
            }

            checkEligibilityCount();
        } catch (error) {
            console.log(error.message)
            setTimeout(() => {
                setInfoMsg('');
            }, 20000);
        }
    }

    const getWalletBalanceHandler = async () => {
        try {
            const walletBalance = await web3.eth.getBalance(address);
            const balanceInEth = web3.utils.fromWei(walletBalance, 'ether');
            const balanceInEth2Decimal = Math.round(balanceInEth * 100) / 100;
            const finalBalance = "ETH Balance: " + balanceInEth2Decimal.toString();

            const ssBalance = await tokenContract.methods.balanceOf(address).call();
            const ssBalanceInEth2Decimal = Math.round(ssBalance) / 10 ** 18;
            const finalSSBalance = ssBalanceInEth2Decimal.toString();
            const balanceWithTxt = "LOT Balance: " + ssBalanceInEth2Decimal.toString();

            if (address) {
                setWalletConnectorText("Connected");
            } else {
                setWalletConnectorText("Connect Wallet");
            }

            // Set the state for both wallet balances and texts in a single setState call
            setWalletBalance(finalBalance);
            setWalletSSBalance(finalSSBalance);
            setWalletSSBalanceTxt(balanceWithTxt);
        } catch (error) {
            console.log(error.message);
            setTimeout(() => {
                setErrorMsg('');
            }, 20000);
        }
    };

    const initializeMetaMask = async () => {
        try {
            const provider = MMSDK.getProvider(); // You can also access via window.ethereum
            if (provider) {
                const web3 = new Web3(provider);
                setWeb3(web3);

                const accounts = await web3.eth.requestAccounts();
                setAddress(accounts[0]);

                const tokenContract = await bettingContract.tokenContract(web3);
                setTokenContract(tokenContract);
            } else {
                console.log('MetaMask is not installed');
                setErrorMsg(<span className='p-2 bg-white'>MetaMask is not installed</span>);
            }
        } catch (err) {
            console.error(err.message);
            setErrorMsg(<span className='p-2 bg-white'>Error While Connecting the Wallet</span>);
            setTimeout(() => {
                setErrorMsg('');
            }, 5000);
        }
    };

    const renderRefresh = () => {
        if (!address) {
            return null
        }
        return (
            <button onClick={connectWalletHandler} className="flex justify-center w-20 gap-2 p-2 m-0 text-white bg-[#1D1C1C] pointer-events-none lg:ml-2 place-items-center lg:pointer-events-auto rounded-xl">Refresh</button>
        )
    }

    const connectWalletHandler = async () => {
        if (web3 === null) {
            await initializeMetaMask();
        } else {
            await initializeMetaMask();
        }
    };

    const redirectToWebsiteHandler = async () => {
        window.open('https://lottogold.vip', '_blank');
    }

    const renderLotto = () => {
        return (
            <div className='mb-14'>
                <div className='flex flex-col items-center w-full mt-7 mb-7'>
                    <h1 className='p-2 text-4xl font-bold text-red-500 uppercase notification-message'>{errorMsg}</h1>
                    <h1 className='p-2 text-4xl font-bold text-green-500 uppercase notification-message'>{successMsg}</h1>
                </div>
                <div className='flex flex-col w-[90vw] border-[10px] border-[#FFAA13] lg:flex-row lottery-bg'>
                    {randomCounter()}
                </div>
            </div>
        );
    }

    const renderJackPot = () => {
        return (
            <div className='flex flex-col border-[10px] border-[#FFAA13] lg:flex-row lottery-bg'>
                <div className='flex flex-col justify-center w-full px-20 py-8 text-center'>
                    <h1 className='font-bold text-[black] text-5xl text-center mb-5'>JACKPOT VALUE</h1>
                    <h1 className='font-bold text-[black] text-8xl text-center'>{jackpotBalance} ETH</h1>
                </div>
            </div>
        );
    }

    async function getRandomNumbers(count) {
        const shuffledNumbers = randomNumbers.slice(); // Copy the original array
        for (let i = shuffledNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledNumbers[i], shuffledNumbers[j]] = [shuffledNumbers[j], shuffledNumbers[i]]; // Shuffle the array
        }
        return shuffledNumbers.slice(0, count);
    }

    const assignTicketToUser = async () => {
        const selectedNumbers = await getRandomNumbers(userEligableForTickets);
        console.log(selectedNumbers);

        if (!address) {
            return null;
        }

        try {
            const response = await fetch('/api/redeemTicket', {
                method: 'POST',
                body: JSON.stringify({ address, selectedNumbers }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setInfoMsg(<span className='p-2 text-center bg-white'>You have successfully redeemed your tickets <br /> </span>);
                connectWalletHandler();
            } else {
                setInfoMsg(<span className='p-2 text-center bg-white'>There is an error please try again later <br /> <span className='text-xl'>For more info check the DAPP guide</span> </span>);
            }

            setTimeout(() => {
                setInfoMsg('');
            }, 5000);
        } catch (error) {
            console.error(error);
        }
    }

    const showUserTickets = () => {
        if (userRedeemedTickets.length === 0) {
            return null;
        }

        const element = document.querySelector('#showTickets');
        element.classList.add('hidden');

        return (
            <div className='flex flex-col items-center'>
                <span className='text-5xl font-bold text-center uppercase mb-7'>Here is your tickets</span>
                {userRedeemedTickets.map((item, index) => (
                    <div key={index} className='flex mt-12 flex-col text-8xl font-semibold text-black border-[10px] border-[#FFAA13] lg:flex-row items-center justify-center lottery-bg'>
                        {item.number}
                    </div>
                ))}
            </div>
        );

    }

    const checkMyTickets = async () => {
        if (!address) {
            return null;
        }

        try {
            const response = await fetch('/api/getWalletTickets', {
                method: 'POST',
                body: JSON.stringify({ walletAddress: address }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { tickets } = await response.json();
                if (tickets) {
                    setUserRedeemedTickets(tickets)
                }
            } else {
                // Handle any response errors
            }
        } catch (error) {
            console.error(error);
        }
    }

    const renderActionButtons = () => {
        if (!address) {
            return null
        };

        if (userWalletExists) {
            return (
                <div className='flex flex-col items-center justify-center' id='showTickets'>
                    <button onClick={checkMyTickets} className="bg-white mx-7 text-[#FFAA13] font-bold py-10 px-14 border-b-4 action-buttons text-3xl">
                        Show Redeemed Tickets
                    </button>
                </div>
            );
        }

        if (!winnerTicketNumber) {
            return (
                <div className='flex items-center justify-center'>
                    <button onClick={checkEligibility} className="bg-white mx-7 text-[#FFAA13] font-bold py-10 px-14 border-b-4 action-buttons text-3xl">
                        Check Eligibility
                    </button>
                    <button onClick={assignTicketToUser} id='assignTicket' className="hidden bg-white mx-7 text-[#FFAA13] font-bold py-10 px-14 border-b-4 action-buttons text-3xl">
                        Redeem Ticket/s
                    </button>
                </div>
            );
        } else {
            return (
                <div className='flex flex-col items-center justify-center'>
                    <p className='mb-5 text-3xl font-bold'>Winning ticket has been drawn. Stay tuned for the next round and more chances to win!</p>
                    <button disabled onClick={checkEligibility} className="py-10 text-3xl font-bold text-black bg-gray-500 border-b-4 mx-7 px-14 action-buttons-disabled">
                        Check Eligibility
                    </button>
                </div>
            )
        }
    }

    const walletExists = async (address) => {
        if (!address) {
            return null;
        }

        try {
            const response = await fetch('/api/findWallet', {
                method: 'POST',
                body: JSON.stringify({ walletAddress: address }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { exists } = await response.json();
                console.log(exists)
                if (exists) {
                    setUserWalletExists(true)
                } else {
                    setUserWalletExists(false)
                }
            } else {
                // Handle any response errors
            }
        } catch (error) {
            console.error(error);
        }
    }

    const drawWinnerTicket = async () => {
        const winnerTicketNo = await getRandomNumbers(1);

        try {
            const response = await fetch('/api/winnerTicket', {
                method: 'POST',
                body: JSON.stringify({ ticket: winnerTicketNo[0].number }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { winnerTicket } = await response.json();
                if (winnerTicket) {
                    setAdminMsg(<span className='p-2 text-center bg-white'>The winner ticket has been drawn<br />Ticket Number: {winnerTicketNo[0].number}</span>);
                    setWinnerTicketNumber(winnerTicketNo[0].number)
                    checkIfWinnerExists(winnerTicketNo[0].number)
                } else {
                    setWinnerTicketNumber(false)
                }
            } else {
                // Handle any response errors
            }

        } catch (error) {
            console.error(error);
        }

    }

    const checkIfWinnerExists = async (winnerTicket) => {
        try {
            const response = await fetch('/api/findWinner', {
                method: 'POST',
                body: JSON.stringify({ ticket: winnerTicket }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { winner } = await response.json();
                if (winner) {
                    setAdminMsg(<span className='p-2 text-center bg-white'>There is a winner<br />{winner}</span>);
                    addWinnerToDB(winner, winnerTicket);
                    connectWalletHandler();
                } else {
                    setAdminMsg(<span className='p-2 text-center bg-white'>There is no winners this round</span>);
                    connectWalletHandler();
                }
            } else {
                setAdminMsg(<span className='p-2 text-center bg-white'>There is an error</span>);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const addWinnerToDB = async (winner, winnerTicket) => {
        try {
            const response = await fetch('/api/winnerUser', {
                method: 'POST',
                body: JSON.stringify({ winnerWallet: winner, winnerTicketNumber: winnerTicket }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { winner } = await response.json();
                console.log(winner)
            } else {
                setAdminMsg(<span className='p-2 text-center bg-white'>There is no winners this round</span>);
            }

        } catch (error) {
            console.error(error);
        }
    }

    const resetdraw = async () => {
        try {
            const response = await fetch('/api/resetWinnerTicket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { reset } = await response.json();
                resetTickets();
            } else {
                // Handle any response errors
            }
        } catch (error) {
            console.error(error);
        }
    }

    const resetTickets = async () => {
        try {
            const response = await fetch('/api/resetTickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { reset } = await response.json();
                setAdminMsg(<span className='p-2 text-center bg-white'>The draw has been reset and a new one started</span>);
                connectWalletHandler();
            } else {
            }
        } catch (error) {
            console.error(error);
        }
    }

    const getWinnerTicket = async () => {
        try {
            const response = await fetch('/api/getWinnerTicket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { winnerTicket } = await response.json();
                if (winnerTicket.document) {
                    const element = document.querySelector('#lottoCounter');
                    element.innerHTML = ""
                    element.innerHTML = "<div class='flex justify-center w-full px-20 py-8 text-center items-center'><span class='text-6xl text-black font-bold uppercase'>Winner:</span><h1 class='font-bold tracking-[5rem] text-[black] text-9xl text-center ml-20'>" + winnerTicket.document.ticket + "</h1></div>";

                    if (winnerTicket) {
                        setWinnerTicketNumber(winnerTicket)
                    } else {
                        setWinnerTicketNumber(false)
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    const renderOwnerFunctions = () => {
        if (address !== null) {
            if (address === owner) {
                return (
                    <div className='flex flex-col items-center p-5 mb-24 bg-white mt-14 admin-section'>
                        <div className='flex flex-col items-center mt-7'>
                            <h1 className='text-4xl font-bold text-black uppercase'>Draw the winner ticket</h1>
                            <h6 className='text-xl font-normal text-black'>Click the button below to DRAW the winner ticket Number</h6>
                        </div>
                        <button onClick={drawWinnerTicket} className="bg-black mx-7 mt-10 text-[#FFAA13] font-bold py-10 px-14 border-b-4 action-buttons text-3xl">
                            DRAW
                        </button>

                        <div className='flex flex-col items-center mt-14'>
                            <h1 className='text-4xl font-bold text-black uppercase'>Reset the DRAW to start a new one</h1>
                            <h6 className='text-xl font-normal text-black'>Click the button below to reset the DRAW and start a new one</h6>
                        </div>
                        <button onClick={resetdraw} className="bg-black mx-7 mt-10 text-[#FFAA13] font-bold py-10 px-14 border-b-4 action-buttons text-3xl">
                            RESTART
                        </button>
                    </div>

                );

            } else {
                return null
            }
        } else {
            return null
        }
    }

    const randomCounter = () => {
        const fakeCounterValues = ['000000', '147433', '488905', '361316', '523583', '458948', '752041', '368549', '557921', '786104', '628773', '410102', '001122', '466321', '193472', '099081'];

        useEffect(() => {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % fakeCounterValues.length);
            }, 50); // Change values every 100 milliseconds

            return () => {
                clearInterval(interval);
            };
        }, []);

        return (
            <div className='flex justify-center w-full px-20 py-8 text-center' id='lottoCounter'>
                <h1 className='font-bold lg:tracking-[5rem] text-[black] text-5xl  lg:text-9xl text-center lg:ml-20'>{fakeCounterValues[currentIndex]}</h1>
            </div>
        );
    }

    const introMessage = () => {
        if (!address) {
            return (
                <div className='flex mt-0 bg-[#fff] header px-8 py-4 mb-10 !shadow-none'>
                    <h1 className='text-2xl font-bold text-black uppercase'>Connect your wallet to be able to draw your tickets</h1>
                </div>
            );
        }
        return;
    }

    return (
        <main className="flex flex-col items-center justify-start min-h-screen p-5 pt-0 lg:px-20">
            <div className="header z-10 items-center justify-between w-full text-sm flex lg:flex-row flex-col bg-[#fff] px-8 pt-10 pb-4 custom-borders">
                <div className="top-0 left-0 flex justify-center w-full pt-8 pb-6 lg:static lg:w-auto lg:p-4">
                    <img className="h-16" src="logo.jpg" />
                </div>
                <div className="left-0 flex flex-col items-end justify-center w-full bg-gradient-to-t lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <div className="flex flex-col items-center justify-center w-full h-full p-4 lg:flex-row lg:p-0">
                        <p className='mr-0 text-lg font-semibold text-black lg:mr-7'>{walletBalance}</p>
                        <p className='mr-0 text-lg font-semibold text-black lg:mr-7'>{walletSSBalanceTxt}</p>
                        <button onClick={connectWalletHandler} className="z-50 flex gap-2 p-2 text-white bg-[#1D1C1C] place-items-center lg:pointer-events-auto rounded-xl lg:m-0 m-1">{walletConnectorText}</button>
                        {renderRefresh()}
                        <button onClick={redirectToWebsiteHandler} className="w-20 justify-center text-center z-50 flex gap-2 p-2 lg:ml-2 text-white bg-[#1D1C1C] place-items-center lg:pointer-events-auto rounded-xl lg:mt-0 mt-1 m-0">Website</button>
                    </div>
                </div>
            </div>
            <div className='flex mt-20 bg-[#fff] header px-8 py-8 mb-10'>
                <h1 className='text-4xl font-bold text-black uppercase'>Unlocking Your Winning Streak</h1>
            </div>
            {introMessage()}
            <div className='flex flex-col items-center justify-around'>
                {renderJackPot()}
                {renderLotto()}
                <div className='mt-10 mb-10'>
                    <div className='flex flex-col items-center w-full mt-3 mb-7'>
                        <h1 className='p-2 text-4xl font-bold text-center text-white uppercase notification-message'>{infoMsg}</h1>
                    </div>
                    {renderActionButtons()}
                    {showUserTickets()}
                </div>
            </div>
            <div className='flex flex-col items-center justify-around p-8'>
                <div className='flex flex-col px-8 py-8 mb-10 text-center bg-white mt-14 header'>
                    <h1 className='text-4xl font-bold text-[#FFAA13] uppercase'>Requirements</h1>
                </div>
                <ol className='w-full p-8 text-left bg-white header'>
                    <li className='mb-2 text-[#FFAA13] text-2xl'><strong>[1] Ticket Entry: You need to hold at least 0.25% Tokens for [1] Ticket.</strong></li>
                    <li className='mb-2 text-[#FFAA13] text-2xl'><strong>[2] Ticket Entry: You need to hold at least 0.5% Tokens for [2] Tickets.</strong></li>
                    <li className='mb-2 text-[#FFAA13] text-2xl'><strong>[3] Ticket Entry: You need to hold at least 1% Tokens for [3] Tickets.</strong></li>
                </ol>
            </div>

            <div className='flex flex-col items-center justify-around w-full mt-10 '>
                <div className='flex flex-col items-center w-full mt-3 mb-7'>
                    <h1 className='p-2 text-4xl font-bold text-center text-white uppercase notification-message'>{adminMsg}</h1>
                </div>
                {renderOwnerFunctions()}
            </div>
        </main>
    )
}

export default lottogold