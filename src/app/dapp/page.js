'use client';
import { MetaMaskSDK } from '@metamask/sdk';
import Web3 from 'web3'
import React, { useState, useEffect } from 'react';
import bettingContract from '../../../blockchain/betting';

const options = {
    dappMetadata: { name: "FightClub DAPP", url: "https://fightClub.vercel.app/dapp" },
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

            setSuccessMsg(<span className='p-2 text-green-500 bg-transparent'>Winners declared successfully!</span>);
        } catch (error) {
            // const errorData = '0x4e487b710000000000000000000000000000000000000000000000000000000000000032';
            // const decodedError = web3.eth.abi.decodeParameter('string', errorData);

            // console.error(decodedError);
            setErrorMsg(<span className='p-2 text-red-600 bg-transparent'>There is an error while handling winners, please try again later or get back to the developer!</span>);
        }
    }

    const placeBetHandler = async (e) => {
        e.preventDefault();
        const teamId = e.target.teamId.value;
        const name = e.target.betName.value;
        const betAmount = e.target.betAmount.value;


        try {
            const pointTwoPercent = (0.01 / 100) * 100000000000
            console.log(Number(walletSSBalance), Number(pointTwoPercent));
            console.log(pointTwoPercent);
            console.log(walletBalance);
            if (Number(walletSSBalance) < Number(pointTwoPercent)) {
                setErrorMsg(<span className='p-2 text-red-600 bg-transparent'>You need to have atleast 0.01% pokebets tokens to place bet</span>);
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

            setSuccessMsg(<span className='p-2 text-green-500 bg-transparent'>Bet placed successfully</span>);
            setTimeout(() => {
                setSuccessMsg('');
            }, 20000);
        } catch (error) {
            console.error(error.message);
            setErrorMsg(<span className='p-2 text-red-600 bg-transparent'>There is an error while placing bet, please try again</span>);
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
            const balanceWithTxt = "FightClub Balance: " + ssBalanceInEth2Decimal.toString();
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
                setErrorMsg(<span className='p-2 text-red-600 bg-transparent'>MetaMask is not installed</span>);
            }
        } catch (err) {
            console.error(err.message);
            setErrorMsg(<span className='p-2 text-red-600 bg-transparent'>Error While Connecting the Wallet</span>);
        }
    };

    const renderRefresh = () => {
        if (!address) {
            return null
        }
        return (
            <button onClick={connectWalletHandler} className="z-50 flex gap-2 p-5 white text-2xl bg-[#d97706] font-bold place-items-center lg:pointer-events-auto button-border lg:m-0 m-1">Refresh</button>
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
        window.open('https://fightclub.vip/', '_blank');
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
                <div className='flex flex-col items-center w-full p-10'>
                    <h1 className='text-6xl font-bold text-white uppercase'>NO FIGHTS ONLINE</h1>
                    <p className='pt-4 text-lg font-bold text-white uppercas'>Connect your wallet or wait for the admin to start a fight</p>
                </div>
            );
        } else if (teams.length % 2 === 0) {
            return (
                <div className='mb-7'>
                    <div className='flex flex-col items-center w-full bg-transparent'>
                        <h1 className='p-2 text-xl font-bold text-red-500 uppercase '>{errorMsg}</h1>
                        <h1 className='p-2 text-xl font-bold text-green-500 uppercase'>{successMsg}</h1>
                    </div>
                    <div className='flex flex-col lg:flex-row'>
                        {teams.map((team, index) => (
                            <div className='flex'>
                                <form onSubmit={(e) => placeBetHandler(e, index)} key={index} className={`flex ${index === 1 ? 'mt-5 lg:mt-64' : ''}`}>
                                    <div className='lg:my-0 my-2 p-12 lg:p-20 lg:pt-10 mx-2 bg-[#000000]'>
                                        <div className='w-full lg:w-[34rem]'>
                                            <div className='p-3 text-lg font-bold text-center text-white uppercase bg-black team-label'>{team.id} - {team.name}</div>
                                            <img className='object-contain w-full h-full mt-1 mb-1' src={`${team.name}.png`} />
                                            <label htmlFor={`betNameTeam${index + 1}`} className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Bet amount</label>
                                            <div className="relative">
                                                <input
                                                    name="betName"
                                                    type="hidden"
                                                    id={`betNameTeam${index + 1}`}
                                                    value='Name'
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

                                                <div className='mt-2 mb-2 text-lg font-bold text-white'>{team.name} total bets: {team.totalTokenBetAmount} ETH</div>
                                                <input
                                                    name='betAmount'
                                                    type="text"
                                                    id={`betAmountTeam${index + 1}`}
                                                    value={index === 0 ? betAmountTeam1 : betAmountTeam2}
                                                    onChange={(e) => handleBetAmountChange(e, index)}
                                                    className="block w-full p-5 text-xl font-bold text-[#d97706] border-[#d97706] border-[3px] input-field bg-white focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Min. Bet 0.01 - Max. Bet 0.1"
                                                    required
                                                />
                                                <button type="submit" className="text-white right-2.5 bottom-2.5 bg-[#d97706] hover.bg-[#faf700] hover.text-[#000000] focus:ring-4 focus.outline-none text-md px-4 py-2 font-bold flex items-center mr-0 ml-auto w-2/4 mt-2 justify-center flex-row submit-button">PLACE YOUR BET</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div className={`${index === 0 ? 'lg:flex hidden' : 'hidden'}`}>
                                    <img className='object-contain w-[200px]' src='vs.png' />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <div className='flex flex-col items-center w-full p-10'>
                    <h1 className='text-6xl font-bold text-white uppercase'>NO FIGHTS ONLINE</h1>
                    <p className='pt-4 text-lg font-bold text-white uppercas'>Connect your wallet or wait for the admin to start a fight</p>
                </div>
            );
        }
    }

    const renderOwnerFunctions = () => {
        if (address !== null) {
            if (address === owner) {
                return (
                    <div className='flex flex-col items-center p-5 mt-14 admin-section bg-[#000000]'>
                        <div className='flex flex-col items-center w-full bg-transparent'>
                            <h1 className='p-2 text-xl font-bold text-red-500 uppercase '>{errorMsg}</h1>
                            <h1 className='p-2 text-xl font-bold text-green-500 uppercase'>{successMsg}</h1>
                        </div>
                        <div className='flex flex-col items-center mt-14'>
                            <h1 className='text-4xl font-bold uppercase'>Choose Winner</h1>
                            <h6 className='text-white text-md font-small'>Winner is by the id, the id you will find in LIVE BATTELS</h6>
                        </div>
                        <form onSubmit={(e) => winnerHandler(e)} className='flex justify-center'>
                            <div className='p-10 winner'>
                                <div className=''>
                                    <label htmlFor='winner' className="mb-2 text-sm font-medium text-white sr-only dark:text-white">Choose Winner</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none h-14 w-9">
                                        </div>
                                        <select
                                            name="winner"
                                            id="winner"
                                            value={winnerId}
                                            onChange={(e) => handleWinnerIdChange(e)}
                                            className="block w-full p-4 pl-10 mb-2 text-xl text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        >
                                            <option value="" disabled>Select Winner ID</option>
                                            <option value="0">Fighter 1</option>
                                            <option value="1">Fighter 2</option>
                                        </select>
                                        <button type="submit" className="text-[#d97706] bg-white mt-8 w-full right-2.5 bottom-2.5 hover.bg-[#faf700] hover.text-[#000000] focus:ring-4 focus.outline-none rounded-xl text-lg px-4 py-2 font-bold">Submit Winner</button>

                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className='flex flex-col items-center'>
                            <h1 className='text-4xl font-bold text-white uppercase'>Add Fighter</h1>
                            <h6 className='text-white text-md font-small'>You should always add 2 fighters, one fighter at a time.</h6>
                        </div>
                        <form onSubmit={(e) => addTeamHandler(e)} className='flex justify-center'>
                            <div className='p-10 addTeam'>
                                <div className=''>
                                    <label htmlFor='winner' className="mb-2 text-sm font-medium sr-only text-whit dark:text-white">Add Team</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none h-14 w-9">
                                        </div>
                                        <select
                                            name="addTeam"
                                            id="addTeam"
                                            value={addTeam}
                                            onChange={(e) => handleAddTeamChange(e)}
                                            className="block w-full p-4 pl-10 mb-2 text-xl text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        >
                                            <option value="" disabled>Select Team</option>
                                            <option value="fighter 1">Fighter 1</option>
                                            <option value="fighter 2">Fighter 2</option>

                                        </select>

                                        <button type="submit" className="text-[#d97706] bg-white mt-8 w-full right-2.5 bottom-2.5 hover.bg-[#faf700] hover.text-[#000000] focus:ring-4 focus.outline-none rounded-xl text-lg px-4 py-2 font-bold">Add Fighter</button>
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
        <main className="flex flex-col items-center justify-start min-h-screen">
            <div class="bg-[#d97706] text-center py-2 lg:px-4 w-full">
                <div class="p-2 border items-center text-indigo-100 leading-none rounded-full flex lg:inline-flex" role="alert">
                    <span class="flex rounded-full bg-[#d97706c4] border uppercase px-2 py-1 text-xs font-bold mr-3">TIP</span>
                    <span class="font-semibold mr-2 text-left flex-auto">Use Desktop for a better user experience</span>
                </div>
            </div>

            <div className="p-1 background-image lg:px-14 lg:pt-0 lg:pb-14">
                <div className="z-10 flex flex-col items-center justify-between w-full px-8 font-mono text-sm lg:flex-row">
                    <div className="top-0 left-0 flex justify-center w-full pt-8 pb-6 lg:static lg:w-auto lg:p-4">
                        <img className="h-60" src="logo.png" />
                    </div>
                    <div className="left-0 flex flex-col items-end justify-center w-full bg-gradient-to-t lg:static lg:h-auto lg:w-auto lg:bg-none">
                        <div className="flex flex-col items-center justify-center w-full h-full p-4 lg:flex-row lg:p-0">
                            <p className={`${walletBalance == '' ? 'hidden' : 'mr-0 text-xl text-white lg:mr-7 flex rounded-full bg-[#d97706] border uppercase px-4 py-1 font-normal'}`}>{walletBalance}</p>
                            <p className={`${walletSSBalanceTxt == '' ? 'hidden' : 'lg:mt-0 mt-2 mr-0 text-xl text-white lg:mr-7 flex rounded-full bg-[#d97706] border uppercase px-4 py-1 font-normal'}`}>{walletSSBalanceTxt}</p>
                            <button onClick={connectWalletHandler} className="z-50 flex gap-2 p-5 white text-2xl bg-[#d97706] font-bold place-items-center lg:pointer-events-auto button-border lg:m-3 m-2">{walletConnectorText}</button>
                            {renderRefresh()}
                        </div>
                    </div>
                </div>

                <div>
                    <div class="gap-5 flex max-md:flex-col max-md:items-stretch max-md:gap-0">
                        <div class="flex flex-col items-stretch w-full max-md:w-full max-md:ml-0">
                            <div class="flex flex-col my-auto px-5 max-md:max-w-full max-md:mt-10">
                                <div
                                    class="text-amber-600 text-3xl font-bold leading-8 self-stretch -mr-5 max-md:max-w-full uppercase"
                                >
                                    Fight Club
                                </div>
                                <div
                                    class="text-white text-5xl font-bold leading-[78px] self-stretch -mr-5 mt-3 max-md:max-w-full max-md:text-4xl max-md:leading-[69px]"
                                >
                                    Unleash the Power of Decentralized Betting: Fight for Your Wins, Your Way!
                                </div>
                                <div
                                    class="text-white text-lg font-medium leading-8 self-stretch -mr-5 mt-10 max-md:max-w-full max-md:mt-10"
                                >
                                    Revolutionizing Fight Betting: Decentralized, Dynamic, and Driven by You. Your Predictions, Your Profit, Your Path to Victory!
                                </div>
                                <button onClick={redirectToWebsiteHandler} className="mt-8 z-50 w-fit flex gap-2 p-5 white text-2xl bg-[#d97706] font-bold place-items-center lg:pointer-events-auto button-border lg:m-3 m-1">Check our Website</button>
                            </div>
                        </div>
                        <div
                            class="flex flex-col items-stretch ml-5 w-full max-md:w-full max-md:ml-0"
                        >
                            <img
                                loading="lazy"
                                src="pngwing.com (2).png"
                                class="object-contain object-center w-full overflow-hidden grow max-md:mt-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-5 lg:mb-48 p-1 lg:pl-14 lg:pr-14">
                <div class="gap-5 flex max-md:items-stretch max-md:gap-0">
                    <div
                        class="flex flex-col items-stretch w-[45%]"
                    >
                        <img
                            loading="lazy"
                            srcset="https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/c612fbf8-68eb-4fa2-8d44-9621c4239bc9?apiKey=9d41954a7b1642fbbc9deb49d45464e5&"
                            class="aspect-[2.3] object-contain object-center w-full overflow-hidden grow max-md:max-w-full"
                        />
                    </div>
                    <div class="flex flex-col items-stretch w-[28%]">
                        <img
                            loading="lazy"
                            srcset="https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/f8e4d414-19b4-4187-b377-10699e33259d?apiKey=9d41954a7b1642fbbc9deb49d45464e5&"
                            class="aspect-[1.41] object-contain object-center w-full overflow-hidden grow"
                        />
                    </div>
                    <div
                        class="flex flex-col items-stretch w-[27%]"
                    >
                        <img
                            loading="lazy"
                            srcset="https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/5a3674af-5472-468c-b050-7e645b301fd5?apiKey=9d41954a7b1642fbbc9deb49d45464e5&"
                            class="aspect-[1.37] object-contain object-center w-full overflow-hidden grow"
                        />
                    </div>
                </div>
            </div>


            {/* <div className='fireline1'></div> */}
            {/* <div className='flex mt-24 bg-[#000000] px-2 mb-5 p-1 lg:pl-14 lg:pr-14'>
                <img src='fight2.png' className='w-[800px]' />
            </div> */}

            <div className='fireline2'></div>
            <div className='flex items-center justify-around p-1 lg:p-14'>
                {renderTeams()}
            </div>
            <div className='fireline2'></div>

            {/* <div className='flex flex-col items-center justify-around'>
                <div className='flex mt-14 bg-[#000000] px-8 py-8 mb-10'>
                    <h1 className='text-4xl font-bold text-white uppercase'>Fight Club Guide</h1>
                </div>
                <ol className='w-full text-left bg-[#000000] header p-8'>
                    <li className='mb-2 text-white'><strong>Fighter 1</strong> Will be on the <span className="text-[#d97706]">bottom left corner</span></li>
                    <li className='mb-2 text-white'><strong>Fighter 2</strong> Will be on the <span className="text-[#d97706]">top right corner</span></li>
                    <img src='ezgif.com-gif-maker.gif' className='w-full' />

                </ol>
            </div> */}

            <div className='flex flex-col items-center justify-around w-full p-1 lg:p-14'>
                <div className='flex mt-14 bg-[#000000] px-8 pt-8'>
                    <h1 className='text-4xl font-bold text-white uppercase'>TWITCH STREAM</h1>
                </div>
                <iframe className='mt-4 lg:w-[60vw] w-[95vw]' id="twitchIframe" src="https://player.twitch.tv/?channel=ren_kisaragi__&parent=https://localhost:3000/dapp" frameborder="0" allowfullscreen="true" height="400px" width="100%"></iframe>
            </div>

            <div className='flex flex-col items-center justify-around p-1 lg:p-14'>
                <div className='flex mt-14 bg-[#000000] px-8 pt-8'>
                    <h1 className='text-4xl font-bold text-white uppercase'>Fight Club Rules</h1>
                </div>
                <ol className='w-full text-left bg-[#000000] fire-bg p-8'>
                    <li className='pb-2 mx-auto my-0 text-white'>1. <strong>Single Bet, Maximum Thrill:</strong> Place one bet per match for an immersive betting experience.</li>
                    <li className='pb-2 mx-auto my-0 text-white '>2. <strong>Start Small, Win Big:</strong> Kick off with a minimum bet amount of 0.01 ETH.</li>
                    <li className='pb-2 mx-auto my-0 text-white'>3. <strong>Dream Big, Bet Wise:</strong> Your excitement has a cap – maximum bet amount is 0.1 ETH.</li>
                    <li className='pb-2 mx-auto my-0 text-white'>4. <strong>Pokebets Token Power:</strong> Unlock betting prowess by holding a minimum amount of pokebets tokens.</li>
                    <li className='pb-2 mx-auto my-0 text-white'>5. <strong>Ethereum Exclusive:</strong> All bets placed exclusively in Ethereum (ETH).</li>
                    <li className='pb-2 mx-auto my-0 text-white'>6. <strong>Winning Unleashed:</strong> Dive into winnings as they flow in post-match conclusion.</li>
                </ol>
            </div>

            <div className='flex items-center justify-around w-full p-1 mt-10 lg:p-14'>
                {renderOwnerFunctions()}
            </div>
        </main>
    )
}

export default Betting