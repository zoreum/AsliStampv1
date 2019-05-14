import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import ipfs from "./utils/ipfs";
import "./App.css";

const qr = require('qr-image');
//const file = require('fs');

//var createPdf = require('./utils/createPDF.js');

class App extends Component {
  
  constructor(props) {
    super(props)
    
    this.state = { 
      storageValue: 0, 
      web3: null, 
      accounts: null,
      account: null, 
      contract: null,
      buffer: null,
      ipfsQR: '',
      ipfsHash:''
    }

    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  };


  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      console.log("Accounts :"+accounts[0]);

      const account = accounts[0];

      /*const contract = require('truffle-contract')
      const simpleStorage = contract(SimpleStorageContract)
      simpleStorage.setProvider(this.state.web3.currentProvider)*/

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      console.log("Network id:"+networkId);
      console.log("Contract:"+  SimpleStorageContract.networks);

      const deployedNetwork = SimpleStorageContract.networks['5777'];

      console.log("Contract address:"+deployedNetwork.address);

      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
     // this.setState({ web3, accounts, contract: instance }, this.runExample);
     this.setState({ web3, accounts, account, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  /*runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };*/

  captureFile(event) {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  };

  onSubmit(event) {
    event.preventDefault()
    const { accounts, contract } = this.state;

    ipfs.files.add(this.state.buffer, (error, result) => {

      if(error) {
        console.error(error)
        return
      }

      console.log("IPF Response:"+result[0].hash);


     // await contract.methods.set(result[0].hash).send({from: accounts[0]});

     // const response = await contract.methods.get().call();

      this.setState({ ipfsHash: result[0].hash });

      this.setIPFSResponse();

      /*contract.methods.set(result[0].hash, { from: this.state.account }).then((r) => {
        return this.setState({ ipfsHash: result[0].hash })
        console.log('ifpsHash', this.state.ipfsHash)
      })*/

    })
  };

  setIPFSResponse = async () => {
    console.log('Enter into setIPFSResponse');

    const { accounts, contract, ipfsHash } = this.state;

    await contract.methods.notarize(ipfsHash).send({ from: accounts[0] })
    .on('transactionHash', (hash) => {
      console.log(hash);
    })
    .on('receipt', (receipt) => {
      console.log(receipt);
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      console.log(confirmationNumber);
      console.log(receipt);
      this.checkContractStatus();
    })
    .on('error', console.error);
    
  }

  checkContractStatus = async () => {
    console.log('Enter into checkContractStatus');

    const { accounts, contract, ipfsHash } = this.state;
    // Get the value from the contract to prove it worked.
    await contract.methods.checkDocument(this.state.ipfsHash).call()
    .then((result) => {

      if (result) {

        console.log("Result"+result);

        if(ipfsHash) {
            const ipfsUrl = "https://ipfs.io/ipfs/"+this.state.ipfsHash;
            var qr_svg = qr.image(ipfsUrl, { type: 'png' });

            ipfs.files.add(qr_svg, (error, result) => {
              if(error) {
                console.error(error)
                return
              }

              console.log("IPF QR Response:"+result[0].hash);
              this.setState({ ipfsQR: result[0].hash });
            });

         /* var output = file.createWriteStream('doc.svg')
          qr_svg.pipe(output);
          console.log("Qr"+qr_svg);
          console.log("Out"+);*/

        } else {
          console.log('No qr');
        }
      }
    }); 
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">AsliStamp DApp</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Your Image to make it Asli</h1>
              <p>Upload image is stored on IPFS & The Ethereum Blockchain!</p>
              <img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>
              
              <h2>Upload Image</h2>
              <form onSubmit={this.onSubmit} >
                <input type='file' onChange={this.captureFile} />
                <input type='submit' />
              </form>
              
            </div>
            <div className="pure-u-1-1">
            <h1>Your Asli QR for the uploaded image</h1>
            <img src={`https://ipfs.io/ipfs/${this.state.ipfsQR}`} alt=""/>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
