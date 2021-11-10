const anchor = require('@project-serum/anchor');

const { SystemProgram } = anchor.web3;

const main = async() => {
  console.log("🚀 Starting test...")

  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Myepicproject;
	
	// Create an account keypair for our program to use.
  const baseAccount = anchor.web3.Keypair.generate();
  // a user to receive money on the tip, hopefully
  const receiver = new anchor.web3.PublicKey("gqVcEWWAtf8U6pxhgFcBvUp6x6cSfPohAsyuVMmB9Zk");

  // Call start_stuff_off, pass it the params it needs!
  let tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [baseAccount],
  });

  console.log("📝 Your transaction signature", tx);

  // Fetch data from the account.
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count', account.totalGifs.toString())

  await program.rpc.addGif("https://media.giphy.com/media/WlsLAnYfrB30p9JK5Z/giphy.gif", {
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
    }
  });

  await program.rpc.upvoteGif("https://media.giphy.com/media/WlsLAnYfrB30p9JK5Z/giphy.gif", {
    accounts: {
      baseAccount: baseAccount.publicKey
    }
  });
  await program.rpc.upvoteGif("https://media.giphy.com/media/WlsLAnYfrB30p9JK5Z/giphy.gif", {
    accounts: {
      baseAccount: baseAccount.publicKey
    }
  });
  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count now',account.totalGifs.toString());
  console.log('👀 GIF List',account.gifList);

  await program.rpc.downvoteGif("https://media.giphy.com/media/WlsLAnYfrB30p9JK5Z/giphy.gif", {
    accounts: {
      baseAccount: baseAccount.publicKey
    }
  });

  account = await program.account.baseAccount.fetch(baseAccount.publicKey);
  console.log('👀 GIF Count now',account.totalGifs.toString());
  console.log('👀 GIF List',account.gifList);

  // have to send a tip from one account to another
  account = await program.rpc.sendTip(new anchor.BN(10000000), {
    accounts: {
      sender: provider.wallet.publicKey,
      receiver: receiver,
      systemProgram: SystemProgram.programId,
    }
  });
  
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();