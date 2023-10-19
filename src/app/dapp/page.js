'use client';
import { MetaMaskSDK } from '@metamask/sdk';
import Web3 from 'web3'
import React, { useState, useEffect } from 'react';
import bettingContract from '../../../blockchain/betting';

const options = {
    dappMetadata: { name: "pokebets DAPP", url: "https://pokebets.vercel.app/dapp" },
    preferDesktop: false
};

const MMSDK = new MetaMaskSDK(options);

const Betting = () => {
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [bets, setBets] = useState('')
    const [betAddress, setBetAddress] = useState('')
    const [walletBalance, setWalletBalance] = useState('')
    const [walletSSBalance, setWalletSSBalance] = useState('')
    const [walletSSBalanceTxt, setWalletSSBalanceTxt] = useState('')
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [vmContract, setVmContract] = useState(null)
    const [teams, setTeams] = useState(null)
    const [owner, setOwner] = useState(null)
    const [winnerId, setWinnerId] = useState(null)
    const [addTeam, setAddTeam] = useState(null)
    const [totalBetAmount, setTotalBetAmount] = useState(null)
    const [tokenContract, setTokenContract] = useState(null)
    const [walletConnectorText, setWalletConnectorText] = useState('Connect Wallet')

    const [totaPlatformlBetAmount, setTotalPlatformBetAmount] = useState('')
    const [betNameTeam1, setBetNameTeam1] = useState('');
    const [betAmountTeam1, setBetAmountTeam1] = useState('');
    const [betNameTeam2, setBetNameTeam2] = useState('');
    const [betAmountTeam2, setBetAmountTeam2] = useState('');

    useEffect(() => {
        if (vmContract && address) getWalletBalanceHandler()
        if (vmContract && address) getTeams()
        if (vmContract && address) getOwner()
    },
        [vmContract, address]
    );

    const getOwner = async () => {
        try {
            const owner = await vmContract.methods.owner().call();
            setOwner(owner)
        } catch (error) {
            console.log(error.message)
        }
    }

    const getTeams = async () => {
        try {
            const teamArray = await vmContract.methods.getAllTeams().call(); // we need to pass the team id here
            const teamsMapping = teamArray.map((team, index) => ({
                id: index,
                name: team.name,
                totalTokenBetAmount: Number(team.totalBetAmount),
            }));
            console.log(teamsMapping)
            const lastTwoTeams = teamsMapping.slice(-2);
            let activeTeams = [];
            let totalBetsAllTeams = 0;
            for (let i = 0; i < lastTwoTeams.length; i++) {
                const team = lastTwoTeams[i];
                const teamId = team.id;
                const teamName = team.name;
                const totalTokenBetAmount = web3.utils.fromWei(team.totalTokenBetAmount.toString(), 'ether');
                totalBetsAllTeams += Number(totalTokenBetAmount);
                activeTeams.push({
                    id: teamId,
                    name: teamName,
                    totalTokenBetAmount,
                });
            }
            console.log(activeTeams);
            setTeams(activeTeams)
            setTotalBetAmount(totalBetsAllTeams)
        } catch (error) {
            console.log(error.message)
        }
    }

    const getTotaPlatformlBetAmount = async () => {
        try {
            const totaBest = await vmContract.methods.totalBetMoney().call(); // we need to pass the team id here
            const totaPlatformlBets = web3.utils.fromWei(totaBest.toString(), 'ether');
            setTotalPlatformBetAmount(`Dapp Total Bets: ${totaPlatformlBetAmount} ETH`)

            console.log(totaPlatformlBets)
        } catch (error) {
            console.log(error.message)
        }
    }

    const resetTeamsHandler = async (e) => {
        e.preventDefault();
        try {
            const result = await vmContract.methods.reset().send({
                from: address,
                to: vmContract.options.address,
            });
        } catch (error) {
            console.error(error.message);
            setErrorMsg(error.message);
        }
    }

    const handleBetNameChange = (e, teamIndex) => {
        // Update the corresponding bet name state based on the teamIndex
        if (teamIndex === 0) {
            setBetNameTeam1(e.target.value);
        } else if (teamIndex === 1) {
            setBetNameTeam2(e.target.value);
        } else if (teamIndex === 2) {
            // Update bet name state for team 3, if needed
        } // Add similar conditions for more teams
    };

    const handleBetAmountChange = (e, teamIndex) => {
        // Update the corresponding bet amount state based on the teamIndex
        if (teamIndex === 0) {
            setBetAmountTeam1(e.target.value);
        } else if (teamIndex === 1) {
            setBetAmountTeam2(e.target.value);
        } else if (teamIndex === 2) {
            // Update bet amount state for team 3, if needed
        } // Add similar conditions for more teams
    };

    const handleWinnerIdChange = (e) => {
        setWinnerId(e.target.value);
    };

    const handleAddTeamChange = (e) => {
        setAddTeam(e.target.value);
    }

    const addTeamHandler = async (e) => {
        e.preventDefault();
        const teamName = e.target.addTeam.value;

        try {
            const result = await vmContract.methods.createTeam(teamName).send({
                from: address,
                to: vmContract.options.address,
            });
            console.log(result);
        } catch (error) {
            console.error(error.message);
            setErrorMsg(error.message);
        }
    }

    const winnerHandler = async (e) => {
        e.preventDefault();
        const winnerIdInt = winnerId.toString();

        try {
            const betAmount = await vmContract.methods.totalBetMoney().call();
            const bet = betAmount.toString();

            const initialGasEstimationBigInt = await vmContract.methods.teamWinDistribution(winnerId).estimateGas({
                value: bet,
                to: vmContract.options.address,
                from: address,
            });

            const initialGasEstimation = Number(initialGasEstimationBigInt);

            const doubledGasLimit = initialGasEstimation * 1;

            const gasPrice = await web3.eth.getGasPrice();
            const gasPriceInWei = BigInt(web3.utils.toWei(gasPrice, 'gwei'));
            const gasCostInWei = BigInt(doubledGasLimit) * gasPriceInWei;

            // const userBalance = await web3.eth.getBalance(address);
            // if (BigInt(userBalance) < BigInt(betAmount) + BigInt(gasCostInWei)) {
            //     return;
            // }

            const result = await vmContract.methods.teamWinDistribution(winnerIdInt).send({
                from: address, //sender
                to: vmContract.options.address, //receiver - contract address
                value: betAmount, // amount to send
                // gasPrice: gasPriceInWei, // gas price in wei
                // gas: doubledGasLimit // gas limit
            });

            setSuccessMsg(<span className='p-2 bg-white'>Winners declared successfully!</span>);
        } catch (error) {
            // const errorData = '0x4e487b710000000000000000000000000000000000000000000000000000000000000032';
            // const decodedError = web3.eth.abi.decodeParameter('string', errorData);

            // console.error(decodedError);
            setErrorMsg(<span className='p-2 bg-white'>There is an error while handling winners, please try again later or get back to the developer!</span>);
        }
    }

    const placeBetHandler = async (e) => {
        e.preventDefault();
        const teamId = e.target.teamId.value;
        const name = e.target.betName.value;
        const betAmount = e.target.betAmount.value;


        try {
            const pointTwoPercent = (0.2 / 100) * 100000000
            console.log(Number(walletSSBalance), Number(pointTwoPercent));
            if (Number(walletSSBalance) < Number(pointTwoPercent)) {
                setErrorMsg(<span className='p-2 bg-white'>You need to have atleast 0.2% pokebets tokens to place bet</span>);
                return;
            }

            const betAmountString = betAmount.toString();
            const betAmountInWei = web3.utils.toWei(betAmountString, 'ether');


            const initialGasEstimationBigInt = await vmContract.methods.createBet(name, teamId).estimateGas({
                from: address,
                to: vmContract.options.address,
                value: betAmountInWei,
            });

            const initialGasEstimation = Number(initialGasEstimationBigInt);

            const doubledGasLimit = initialGasEstimation * 1;

            const gasPrice = await web3.eth.getGasPrice();
            const gasPriceInWei = BigInt(web3.utils.toWei(gasPrice, 'gwei'));
            const gasCostInWei = BigInt(doubledGasLimit) * gasPriceInWei;

            // const userBalance = await web3.eth.getBalance(address);
            // if (BigInt(userBalance) < BigInt(betAmountInWei) + BigInt(gasCostInWei)) {
            //     setErrorMsg('Insufficient balance to place bet + gas cost');
            //     return;
            // }

            const result = await vmContract.methods.createBet(name, teamId).send({
                to: vmContract.options.address,
                from: address,
                value: betAmountInWei,
            });

            setSuccessMsg(<span className='p-2 bg-white'>Bet placed successfully</span>);
            setTimeout(() => {
                setErrorMsg('');
            }, 20000);
        } catch (error) {
            console.error(error.message);
            setErrorMsg(<span className='p-2 bg-white'>There is an error while placing bet, please try again later</span>);
            setTimeout(() => {
                setErrorMsg('');
            }, 20000);
        }
    };

    const getWalletBalanceHandler = async () => {
        try {
            const walletBalance = await web3.eth.getBalance(address);
            const balanceInEth = web3.utils.fromWei(walletBalance, 'ether');
            const balanceInEth2Decimal = Math.round(balanceInEth * 100) / 100;
            const finalBalance = "ETH Balance: " + balanceInEth2Decimal.toString();
            setWalletBalance(finalBalance)

            const ssBalance = await tokenContract.methods.balanceOf(address).call();
            const ssBalanceInEth2Decimal = Math.round(ssBalance) / 10 ** 8;
            const finalSSBalance = ssBalanceInEth2Decimal.toString();
            const balanceWithTxt = "pokebets Balance: " + ssBalanceInEth2Decimal.toString();
            setWalletSSBalance(finalSSBalance)
            setWalletSSBalanceTxt(balanceWithTxt)

            if (address) {
                setWalletConnectorText("Connected")
            } else {
                setWalletConnectorText("Connect Wallet")
            }

        } catch (error) {
            console.log(error.message)
        }
    }

    const initializeMetaMask = async () => {
        try {
            const provider = MMSDK.getProvider(); // You can also access via window.ethereum
            if (provider) {
                const web3 = new Web3(provider);
                setWeb3(web3);

                // Request Ethereum accounts
                const accounts = await web3.eth.requestAccounts();
                setAddress(accounts[0]);

                // Continue with other initialization steps as needed
                const vm = await bettingContract.bettingContract(web3);
                setVmContract(vm);

                const tokenContract = await bettingContract.tokenContract(web3);
                setTokenContract(tokenContract);
            } else {
                console.log('MetaMask is not installed');
                setErrorMsg(<span className='p-2 bg-white'>MetaMask is not installed</span>);
            }
        } catch (err) {
            console.error(err.message);
            setErrorMsg(<span className='p-2 bg-white'>Error While Connecting the Wallet</span>);
        }
    };

    const renderRefresh = () => {
        if (!address) {
            return null
        }
        return (
            <button onClick={connectWalletHandler} className="flex justify-center w-20 gap-2 p-2 m-0 text-black bg-white pointer-events-none lg:ml-2 place-items-center lg:pointer-events-auto rounded-xl">Refresh</button>
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
        window.open('https://pokebets.vip/', '_blank');
    }

    // const connectWalletHandler = async () => {
    //     // Detect Ethereum provider
    //     const provider = await MetaMaskSDK.create({});

    //     if (provider) {
    //         try {
    //             // Use the detected provider to initialize MetaMask
    //             const web3 = new Web3(provider);
    //             setWeb3(web3);

    //             // Request Ethereum accounts
    //             const accounts = await web3.eth.requestAccounts();
    //             setAddress(accounts[0]);

    //             // Continue with other initialization steps as needed
    //             const vm = await bettingContract.bettingContract(web3);
    //             setVmContract(vm);

    //             const tokenContract = await bettingContract.tokenContract(web3);
    //             setTokenContract(tokenContract);

    //             // Now, MetaMask is connected and initialized
    //         } catch (err) {
    //             console.log(err.message);
    //             setErrorMsg(<span className='p-2 bg-white'>Error While Connecting the Wallet</span>);
    //         }
    //     } else {
    //         console.log('MetaMask is not installed');
    //         setErrorMsg(<span className='p-2 bg-white'>MetaMask is not installed</span>);
    //     }
    // };


    const renderTeams = () => {
        if (!teams || teams.length === 0) {
            return (
                <div className='flex w-full p-10 bg-white mt-14'>
                    <h1 className='text-3xl font-bold uppercase text-[#000000]'>NO LIVE BATTLES, STAY TUNED</h1>
                </div>
            );
        } else if (teams.length % 2 === 0) {
            return (
                <div className='mb-14'>
                    <div className='flex flex-col items-center w-full mt-7 mb-7'>
                        <h1 className='p-2 text-xl font-bold text-red-500 uppercase '>{errorMsg}</h1>
                        <h1 className='p-2 text-xl font-bold text-green-500 uppercase'>{successMsg}</h1>
                    </div>
                    <div className='flex flex-col lg:flex-row'>
                        {teams.map((team, index) => (
                            <form onSubmit={(e) => placeBetHandler(e, index)} key={index} className='flex'>
                                <div className='lg:my-0 my-2 p-12 lg:p-20 mx-2 team h-[570px] bg-[#000000]'>
                                    <div className='w-60 h-60'>
                                        <div className='p-3 bg-white text-[#000000] team-label text-center font-bold'>#{team.id} - {team.name}</div>
                                        <img className='object-cover w-full h-full mt-1 mb-1' src={`${team.name}.png`} />
                                        <label htmlFor={`betNameTeam${index + 1}`} className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Bet amount</label>
                                        <div className="relative">
                                            <input
                                                name="betName"
                                                type="text"
                                                id={`betNameTeam${index + 1}`}
                                                value={index === 0 ? betNameTeam1 : betNameTeam2}
                                                onChange={(e) => handleBetNameChange(e, index)}
                                                className="block w-full p-4 mb-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                placeholder="Your Name"
                                                required
                                            />
                                            <input
                                                name="teamId"
                                                type="hidden"
                                                id={`teamIdTeam${index + 1}`}
                                                value={team.id}
                                                className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                placeholder="Team ID"
                                                required
                                            />
                                            <input
                                                name='betAmount'
                                                type="text"
                                                id={`betAmountTeam${index + 1}`}
                                                value={index === 0 ? betAmountTeam1 : betAmountTeam2}
                                                onChange={(e) => handleBetAmountChange(e, index)}
                                                className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                placeholder="Min. 0.01 - Max. 0.1"
                                                required
                                            />
                                            <button type="submit" className="text-[#000000] absolute right-2.5 bottom-2.5 bg-white hover.bg-[#faf700] hover.text-[#000000] focus:ring-4 focus.outline-none rounded-xl text-sm px-4 py-2 font-bold">BET</button>
                                        </div>
                                        <div className='text-lg font-bold'>Total Bets: {team.totalTokenBetAmount} ETH</div>
                                    </div>
                                </div>
                            </form>
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <div className='flex w-full p-10 bg-white mt-14'>
                    <h1 className='text-3xl font-bold uppercase text-[#000000]'>NO LIVE BATTLES, STAY TUNED</h1>
                </div>
            );
        }
    }

    const renderOwnerFunctions = () => {
        if (address !== null) {
            if (address === owner) {
                return (
                    <div className='flex flex-col items-center p-5 mt-14 admin-section bg-[#000000]'>
                        <div className='flex flex-col items-center mt-14'>
                            <h1 className='text-4xl font-bold uppercase'>Choose Winner</h1>
                            <h6 className='text-white text-md font-small'>Winner is by the id, the id you will find in LIVE BATTELS</h6>
                        </div>
                        <form onSubmit={(e) => winnerHandler(e)} className='flex justify-center'>
                            <div className='p-10 winner'>
                                <div className=''>
                                    <label htmlFor='winner' className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Choose Winner</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none h-14 w-9">
                                        </div>
                                        <input
                                            name="winner"
                                            type="text"
                                            id="winner"
                                            value={winnerId}
                                            onChange={(e) => handleWinnerIdChange(e)}
                                            className="block w-full p-4 pl-10 mb-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Winner ID"
                                            required
                                        />
                                        <button type="submit" className="text-[#faf700] absolute right-2.5 bottom-2.5 bg-[#000000] hover.bg-[#faf700] hover.text-[#000000] focus:ring-4 focus.outline-none rounded-xl text-sm px-4 py-2 font-bold">Winner</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className='flex flex-col items-center'>
                            <h1 className='text-4xl font-bold uppercase'>Add Fighter</h1>
                            <h6 className='text-white text-md font-small'>You should always add 2 fighters, one fighter at a time.</h6>
                        </div>
                        <form onSubmit={(e) => addTeamHandler(e)} className='flex justify-center'>
                            <div className='p-10 addTeam'>
                                <div className=''>
                                    <label htmlFor='winner' className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Add Team</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none h-14 w-9">
                                        </div>
                                        <input
                                            name="addTeam"
                                            type="text"
                                            id="addTeam"
                                            value={addTeam}
                                            onChange={(e) => handleAddTeamChange(e)}
                                            className="block w-full p-4 pl-10 mb-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Team"
                                            required
                                        />
                                        <button type="submit" className="text-[#faf700] absolute right-2.5 bottom-2.5 bg-[#000000] hover.bg-[#faf700] hover.text-[#000000] focus:ring-4 focus.outline-none rounded-xl text-sm px-4 py-2 font-bold">Add Team</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className='flex flex-col items-center'>
                            <h1 className='text-4xl font-bold uppercase'>Reset</h1>
                            <h6 className='text-white text-md font-small'>Start from a clean state</h6>
                        </div>
                        <form onSubmit={(e) => resetTeamsHandler(e)} className='flex justify-center'>
                            <div className='p-5 addTeam'>
                                <div className=''>
                                    <label htmlFor='reset' className="mb-1 text-sm font-medium text-gray-900 sr-only dark:text-white"></label>
                                    <div className="relative">
                                        <button type="submit" className="text-white w-32 bg-red-800 hover.bg-[#faf700] hover.text-[#000000] focus:ring-4 focus.outline-none rounded-xl text-sm px-4 py-2 font-bold">Reset</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                );

            } else {
                return null
            }
        } else {
            return null
        }
    }

    return (
        <main className="flex flex-col items-center justify-start min-h-screen p-1 lg:p-14">
            <div className="header z-10 items-center justify-between w-full font-mono text-sm flex lg:flex-row flex-col bg-[#000000] px-8">
                <div className="top-0 left-0 flex justify-center w-full pt-8 pb-6 lg:static lg:w-auto lg:p-4">
                    <img className="h-20" src="logo.webp" />
                </div>
                <div className="left-0 flex flex-col items-end justify-center w-full bg-gradient-to-t lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <div className="flex flex-col items-center justify-center w-full h-full p-4 lg:flex-row lg:p-0">
                        <p className='mr-0 text-white lg:mr-7'>{walletBalance}</p>
                        <p className='mr-0 text-white lg:mr-7'>{walletSSBalanceTxt}</p>
                        <button onClick={connectWalletHandler} className="z-50 flex gap-2 p-2 text-[#000000] bg-white place-items-center lg:pointer-events-auto rounded-xl lg:m-0 m-1">{walletConnectorText}</button>
                        {renderRefresh()}
                        <button onClick={redirectToWebsiteHandler} className="w-20 justify-center text-center z-50 flex gap-2 p-2 lg:ml-2 text-white bg-[#1D1C1C] place-items-center lg:pointer-events-auto rounded-xl lg:mt-0 mt-1 m-0">Website</button>
                    </div>
                </div>
            </div>
            <div className='flex mt-14 bg-[#000000] header px-8 py-8 mb-10'>
                <h1 className='text-4xl font-bold uppercase'>live battles</h1>
            </div>
            <div className='flex items-center justify-around'>
                {renderTeams()}
            </div>

            <div className='flex flex-col items-center justify-around'>
                <div className='flex mt-14 bg-[#000000] header px-8 py-8 mb-10'>
                    <h1 className='text-4xl font-bold uppercase'>Guide</h1>
                </div>
                <ol className='w-full text-left bg-[#000000] header p-8'>
                    <li className='mb-2'><strong>TRAINER 1</strong> Will be on the <span className="text-[red]">bottom left corner</span></li>
                    <li className='mb-2'><strong>TRAINER 2</strong> Will be on the <span className="text-[red]">top right corner</span></li>
                    <img src='ezgif.com-gif-maker.gif' className='w-full' />

                </ol>
            </div>
            <div className='flex flex-col items-center justify-around p-8'>
                <div className='flex mt-14 bg-[#000000] header px-8 py-8 mb-10'>
                    <h1 className='text-4xl font-bold uppercase'>Rules</h1>
                </div>
                <ol className='w-full text-left bg-[#000000] header p-8'>
                    <li className='mb-2'>1. <strong>One Bet Per Match:</strong> Users are allowed to place a single bet per match.</li>
                    <li className='mb-2'>2. <strong>Minimum Bet Amount:</strong> The minimum bet amount is 0.01 ETH.</li>
                    <li className='mb-2'>3. <strong>Maximum Bet Amount:</strong> The maximum bet amount is 0.1 ETH.</li>
                    <li className='mb-2'>4. <strong>Minimum pokebets Token Requirement:</strong> Users must hold a minimum amount of pokebets tokens to place a bet.</li>
                    <li className='mb-2'>5. <strong>Bets in ETH:</strong> All bets are to be placed in Ethereum (ETH).</li>
                    <li className='mb-2'>6. <strong>Winnings Distribution:</strong> Winnings will be distributed once the match concludes.</li> 
                </ol>
            </div>

            <div className='flex items-center justify-around w-full mt-10'>
                {renderOwnerFunctions()}
            </div>
        </main>
    )
}

export default Betting