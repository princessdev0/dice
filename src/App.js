import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SimpleCasinoABI from './SimpleCasinoABI'; // Replace with the correct path to your ABI file
import './App.css';

const App = () => {
  const [message, setMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Declare web3 here
  const web3 = new Web3(window.ethereum);

  useEffect(() => {
    // Check if a wallet is already connected on component mount
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check if a wallet is connected
      const accounts = await web3.eth.getAccounts();

      if (accounts.length > 0) {
        // If a wallet is connected, set the wallet address
        setWalletAddress(accounts[0]);
        setMessage(`Connected to INNOVATOR network with Chain ID: ${await web3.eth.getChainId()}`);
        setIsWalletConnected(true);
      } else {
        setMessage('No wallet connected.');
        setIsWalletConnected(false);
      }
    } catch (error) {
      console.error('Error connecting to blockchain:', error);
      setMessage('Error connecting to blockchain. See console for details.');
    }
  };

  const handleClick = async () => {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Set the wallet address
      setWalletAddress(accounts[0]);
      setMessage(`Connected to INNOVATOR network with Chain ID: ${await web3.eth.getChainId()}`);
      setIsWalletConnected(true);

      // Handle any additional logic here
    } catch (error) {
      console.error('Error connecting to blockchain:', error);
      setMessage('Error connecting to blockchain. See console for details.');
    }
  };

  const handleRoll = async () => {
    try {
      const betAmount = parseInt(document.getElementById('betAmount').value, 10);
      const minValue = parseInt(document.getElementById('minValue').value, 10);
      const maxValue = parseInt(document.getElementById('maxValue').value, 10);

      // Initialize Web3 and the contract instance
      const contractAddress = '0x9C3Ba42a60462f89454de5014F2603EA8fDbaceA'; // Replace with your contract address
      const simpleCasinoContract = new web3.eth.Contract(SimpleCasinoABI, contractAddress);

      // Log before calling the bet function
      console.log('Before calling bet function');

      // Call the bet function in your smart contract
      const transactionParameters = {
        from: walletAddress,
        gas: 500000, // Adjust the gas limit accordingly
        gasPrice: web3.utils.toWei('20', 'gwei'), // Adjust the gas price accordingly
      };

      const receipt = await simpleCasinoContract.methods.bet(minValue, maxValue, betAmount).send(transactionParameters);

      // Log events emitted by the smart contract
      console.log('Events emitted:', receipt.events);

      // Log after calling the bet function
      console.log('After calling bet function');

      // Handle any additional logic or UI updates here
    } catch (error) {
      console.error('Error rolling:', error);
      setMessage(`Error rolling. See console for details: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="button-container">
        <button className="button" onClick={handleClick}>
          Connect to Blockchain
        </button>
      </div>
      {walletAddress && <p className="wallet-address">Wallet Address: {walletAddress}</p>}
      <div className="new-textfield">
        <input type="text" id="betAmount" placeholder="Enter Bet Amount" />
      </div>
      <div className="centered-textfield">
        <input type="text" id="minValue" placeholder="Enter Min value" />
      </div>
      <div className="second-textfield">
        <input type="text" id="maxValue" placeholder="Enter Max Value" />
      </div>
      <div className="button-below-textfields">
        <button className="button" onClick={handleRoll}>
          Roll
        </button>
      </div>
    </div>
  );
};

export default App;
