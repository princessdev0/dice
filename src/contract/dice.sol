pragma solidity ^0.4.23;

contract SimpleCasino {
    uint public houseEdge;
    uint public totalFunds;
    uint public jackpot;

    mapping(address => uint) public playerBalances;

    event Won(address indexed player, bool status, uint amount, bool jackpotWon);
    event Withdraw(address indexed player, uint amount);
    event Deposit(address indexed player, uint amount);
    event EmergencyStop(bool stopped);

    bool public isEmergencyStopped;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notEmergencyStopped() {
        require(!isEmergencyStopped, "Contract is emergency stopped");
        _;
    }

    modifier nonReentrant() {
        require(!reentrancyGuard, "Reentrant call detected");
        reentrancyGuard = true;
        _;
        reentrancyGuard = false;
    }

    address private owner;
    bool private reentrancyGuard;

    constructor(uint _houseEdge) payable public {
        require(_houseEdge <= 100);
        houseEdge = _houseEdge;
        totalFunds = msg.value;
        owner = msg.sender;
    }

    function bet(uint _startRange, uint _endRange, uint _betAmount) payable public notEmergencyStopped nonReentrant {
        require(_startRange > 0 && _endRange <= 10 && _startRange <= _endRange);
        require(_betAmount > 0 && _betAmount <= msg.value);

        uint winningNumber = uint(keccak256(abi.encodePacked(blockhash(block.number - 1)))) % 10 + 1;
        bool jackpotWon = (winningNumber == 7);  // Jackpot if the winning number is 7
        uint amountWon = _betAmount * (100 - houseEdge) / (_endRange - _startRange + 1);
        
        if (jackpotWon) {
            jackpot = 0;  // Reset jackpot
            // Award the jackpot to the player
            amountWon += jackpot;
            jackpot = 0;
        } else {
            jackpot += _betAmount / 10;  // 10% of the bet contributes to the jackpot
        }

        if (winningNumber >= _startRange && winningNumber <= _endRange) {
            playerBalances[msg.sender] += amountWon;
            totalFunds -= amountWon;
            emit Won(msg.sender, true, amountWon, jackpotWon);
        } else {
            emit Won(msg.sender, false, 0, false);
        }
    }

    function withdraw() public notEmergencyStopped nonReentrant {
        uint balance = playerBalances[msg.sender];
        require(balance > 0, "No winnings to withdraw");
        playerBalances[msg.sender] = 0;
        if (!msg.sender.send(balance)) {
            playerBalances[msg.sender] = balance; // Revert player balance if the transfer fails
            revert();
        }
        emit Withdraw(msg.sender, balance);
    }

    function deposit() payable public notEmergencyStopped {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        playerBalances[msg.sender] += msg.value;
        totalFunds += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function getPlayerBalance() public view returns (uint) {
        return playerBalances[msg.sender];
    }

    function getHouseBalance() public view returns (uint) {
        return totalFunds;
    }

    function getJackpot() public view returns (uint) {
        return jackpot;
    }

    function emergencyStop() public onlyOwner {
        require(!isEmergencyStopped, "Contract is already emergency stopped");
        isEmergencyStopped = true;
        emit EmergencyStop(true);
    }

    function resume() public onlyOwner {
        require(isEmergencyStopped, "Contract is not emergency stopped");
        isEmergencyStopped = false;
        emit EmergencyStop(false);
    }

    // Fallback function to reject incoming Ether transfers
    function () external payable {
        revert("Fallback function is not allowed");
    }
}
