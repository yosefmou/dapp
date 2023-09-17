// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "./ownable.sol";
import "./ATM.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// SSTOKEN CONTRACT 0xe9c038aE26Dc29cC24014fECb6cC4F6c24158956
contract ssdapp is ATM, Ownable {

    event NewBet(
        address addy, 
        uint amount, 
        uint teamId
    );

    struct Bet {
        string name;
        address addy;
        uint amount;
        uint teamId;
    }

    struct Team {
        string name;
        uint totalBetAmount;
    }

    Bet[] public bets;
    Team[] public teams;
    address payable conOwner;
    uint public totalBetMoney = 0;
    uint public numTeams;
    using SafeMath for uint256;

    // if the address has already placed a bet, they can't place another one
    // 0 = no bet, 1 = bet
    mapping (address => uint) public numBetsAddress;

    bool private locked;

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor() payable {
        conOwner = payable(msg.sender);
        numTeams = 0;
    }

    function createTeam (string memory _name) public onlyOwner() {
        numTeams++;
        teams.push(Team(_name, 0));
    }

    // return total bet amount of a team
    function getTotalBetAmount (uint _teamId) public view returns (uint) {
        return teams[_teamId].totalBetAmount;
    }

    function getTotalBetMoney() public view returns (uint) {
        return totalBetMoney;
    }

    function getAllTeams() public view returns (Team[] memory) {
        return teams;
    }

    // users can bet on a team
    function createBet (string memory _name, uint _teamId) external payable {       
        require (msg.sender != conOwner, "Owner can't make a bet");
        require (numBetsAddress[msg.sender] == 0, "You have already placed a bet");
        require (msg.value > 0.009 ether, "Bet More");
        require (msg.value < 0.1 ether, "Bet Less");


        deposit();

        bets.push(Bet(_name, msg.sender, msg.value, _teamId));

        teams[_teamId].totalBetAmount += msg.value;

        numBetsAddress[msg.sender]++;
        
        (bool sent, bytes memory data) = conOwner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        totalBetMoney += msg.value;

        emit NewBet(msg.sender, msg.value, _teamId);
    }

    function teamWinDistribution(uint _teamId) external payable onlyOwner() nonReentrant() {
        deposit();
        require(_teamId < numTeams, "Invalid team ID");

        uint div;

        for (uint i = 0; i < bets.length; i++) {
            if (bets[i].teamId == _teamId) {
                address payable receiver = payable(bets[i].addy);
                
                div = bets[i].amount.mul(10000 + getTotalBetAmount(numTeams - 1 - _teamId).mul(10000).div(getTotalBetAmount(_teamId))).div(10000);
                
                (bool sent, bytes memory data) = receiver.call{value: div}("");
                require(sent, "Failed to send Ether");
            }
        }

        totalBetMoney = 0;
        for (uint i = 0; i < bets.length; i++) {
            numBetsAddress[bets[i].addy] = 0;
        }

        delete teams;
        delete bets;
        numTeams = 0;
    }

    receive() external payable {
    }
}
