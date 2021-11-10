import { useEffect, useState } from 'react';
import './App.css';
import idl from './idl.json';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Provider, Program, web3 } from '@project-serum/anchor';
import kp from './keypair.json';
import { BN } from 'bn.js';

const { SystemProgram } = web3;
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed"
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  // useEffects
  useEffect(() => {
    if(walletAddress){
      getGifList();
    }
  }, [walletAddress]);

  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  // functions
  const connectWallet = async () => {
    const { solana } = window;
    if(solana){
      const response = await solana.connect();
      console.log('connected',response);
      setWalletAddress(response.publicKey.toString());
    }
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const getGifList = async () => {
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log('got account',account);
      setGifList(account.gifList);
    }catch(error){
      console.error('error in getGifs',error);
      setGifList(null);
    }
  }

  const getProvider = () => {
    const connection = new Connection(network,opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment
    );
    return provider;
  }

  const checkIfWalletIsConnected = async () => {
    try{
      const { solana } = window;

      if(solana){
        console.log('has solana',walletAddress);
        if(solana.isPhantom){
          const response = await solana.connect({onlyIfTrusted: true});
          console.log('Connected with Phantom:',response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      }else{
        alert('solana object not found! get a wallet');
      }
    }catch(error){
      console.error('error',error);
    }
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect Wallet
    </button>
  );

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const sendGif = async () => {
    if(inputValue.length===0){
      console.log('empty input try again');
      return
    }
    console.log('gif link',inputValue);
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      await getGifList();
    }catch(err){
      console.error("error sending gif",err);
    }
  }

  const upvoteGif = async (event) => {
    event.preventDefault();

    try{
      const index = event.target.value;
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.upvoteGif(new BN(index), {
        accounts: {
          baseAccount: baseAccount.publicKey
        }
      });
      await getGifList();
    }catch(err){
      console.error('err upvoting gif',err);
    }
  }
  const downvoteGif = async (event) => {
    event.preventDefault();

    try{
      const index = event.target.value;
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.downvoteGif(new BN(index), {
        accounts: {
          baseAccount: baseAccount.publicKey
        }
      });
      await getGifList();
    }catch(err){
      console.error('err downvoting gif',err);
    }
  }
  const sendTip = async (event) => {
    console.log('send tip',event.target.value);
    event.preventDefault();
    try{
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.sendTip(new BN(10000000), {
        accounts: {
          sender: provider.wallet.publicKey,
          receiver: event.target.value,
          systemProgram: SystemProgram.programId,
        }
      });
    }catch(err){
      console.error('error making tip',err);
    }
  }

  const renderConnectedContainer = () => {
    if(gifList==null){
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    }else{
      return (
        <div className="connected-container">
          <p className="sub-text">Reading the gif collection of {walletAddress}</p>
          <input 
            type="text" 
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button className="cta-button submit-gif-button" onClick={sendGif}>Submit</button>
          <div className="gif-grid">
            {gifList.map((gif,index) => (
              <div className="gif-item" key={gif.gifLink}>
                <img src={gif.gifLink} alt={gif.gifLink} />
                <p className="gif-item-user">Curated by {gif.userAddress.toString()}</p>
                <div>
                  <button onClick={upvoteGif} value={index}>Upvote</button>
                  <span className="sub-text">{gif.votes}</span>
                  <button onClick={downvoteGif} value={index}>Downvote</button>
                </div>
                <div>
                  <p className="sub-text">Love the gif?</p>
                  <button onClick={sendTip} value={gif.userAddress}>Send a Tip</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🖼 Dune GIF Collection</p>
          <p className="sub-text">
            The finest moments of Dune captured on film ✨
          </p>
          {walletAddress ? renderConnectedContainer() : renderNotConnectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;
