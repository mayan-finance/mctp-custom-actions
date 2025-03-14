import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {MctpPayloadWriter} from "../../target/types/mctp_payload_writer";
import {Mctp} from "./mctp_types";
import {wallet, connection, executeTrx, chains} from './utils';
import {PublicKey} from "@solana/web3.js";
import {
    getAssociatedTokenAddressSync,
    createTransferInstruction,
    createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';
import {Contract, Wallet as EvmWallet, JsonRpcProvider, ethers} from "ethers";
import MayanCircleArtifact from "./MayanCircleArtifact";

async function bridgeWithFee() {
    // Set up the provider to use the local cluster.
    anchor.setProvider(new anchor.AnchorProvider(connection, wallet));
    const mctpPayloadWriter = anchor.workspace.MctpPayloadWriter as Program<MctpPayloadWriter>;
    const mctp = anchor.workspace.Mctp as Program<Mctp>;

    console.log('Creating payload account...');
    const payloadNonce = 1;
    const data = Buffer.from("Hello, world!");

    // Derive the public key for the payload account.
    const payload = anchor.web3.PublicKey.findProgramAddressSync([
        Buffer.from("PAYLOAD"),
        wallet.publicKey.toBuffer(),
        (() => {
            const buf = Buffer.alloc(2);
            buf.writeUInt16LE(payloadNonce, 0);
            return buf;
        })()
    ], mctpPayloadWriter.programId)[0];

    const createPayloadAccountIx = await mctpPayloadWriter.methods.createSimple(payloadNonce, data).accounts({
        payer: wallet.publicKey,
        payload,
        systemProgram: anchor.web3.SystemProgram.programId,
    }).instruction();

    const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const random = anchor.web3.Keypair.generate().publicKey.toBytes();
    const fundsOwner = wallet.publicKey;
    const fundsOwnerTokenAccount = getAssociatedTokenAddressSync(mint, fundsOwner, true);

    // The ledger account is a PDA used to store bridge-related information.
    // It also acts as the owner of `ledgerTokenAccount`, which will hold the transferred funds.
    // Once initialized, a relayer can execute the bridge operation, covering the rent for
    // Circle and Wormhole message accounts while receiving a `feeSolana` from the initial funds.

    // If no relayer executes the bridge, the funds can be returned to `fundsOwner`
    // via the `withdraw_ledger` instruction.
    const ledger = anchor.web3.PublicKey.findProgramAddressSync([
        Buffer.from("LEDGER_BRIDGE"),
        fundsOwner.toBuffer(),
        random,
    ], mctp.programId)[0];

    // Funds will be transferred to this account first, and the bridge will be initialized
    // with the same transaction block.
    const ledgerTokenAccount = getAssociatedTokenAddressSync(mint, ledger, true);
    const createLedgerTokenAccountIx = createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey, ledgerTokenAccount, ledger, mint
    );

    const bridgeMode = 1; // Mode: bridge_with_fee

    // The fee rewarded to the entity executing the `bridge_with_fee` instruction.
    const feeSolana = new anchor.BN(0);

    // The fee paid to the entity calling the `redeem_with_fee` function on the destination chain.
    // For custom payloads, this is typically set to zero.
    const feeRedeem = new anchor.BN(0);

    // The destination address (should be exactly 32 bytes).
    const evmWallet = new EvmWallet(process.env.EVM_PRIVATE_KEY as string);
    const addrDest = Uint8Array.from(
        Buffer.from(
            '000000000000000000000000' +
            evmWallet.address.slice(2), // Destination address
            'hex'
        )
    );

    // The Wormhole chain ID of the destination chain.
    const chainDest = chains.avalanche;

    const amountIn = new anchor.BN(1000000); // Amount: 1 USDC

    // This value is verified by the program and can be used for slippage protection if `ledgerTokenAccount`
    // is funded by other instructions (e.g., a swap) instead of a direct transfer.
    const amountInMin = amountIn;

    // The amount of gas the relayer should transfer to the destination address.
    // For custom payloads, this is typically set to zero.
    const gasDrop = new anchor.BN(0);

    // Create the instruction to transfer funds to the ledger token account.
    const transferIx = createTransferInstruction(
        fundsOwnerTokenAccount, ledgerTokenAccount, fundsOwner, BigInt(amountIn.toString())
    );

    // Create the instruction to initialize the bridge with fee parameters.
    const initiateBridgeWithFeeIx = await mctp.methods.initBridgeLedger({
        addrDest: Array.from(addrDest),
        chainDest,
        mode: bridgeMode,
        keyRnd: Array.from(random),
        feeRedeem,
        feeSolana,
        amountInMin,
        gasDrop,
    }).accounts({
        ledger,
        ledgerAcc: ledgerTokenAccount,
        customPayloadStore: payload,
        systemProgram: anchor.web3.SystemProgram.programId,
        mintFrom: mint,
    }).instruction();

    // Create the instruction to close the payload account.
    const closePayloadAccountIx = await mctpPayloadWriter.methods.close(payloadNonce).accounts({
        payload,
        payer: wallet.publicKey,
    }).instruction();

    // Execute the transaction.
    // await executeTrx([createPayloadAccountIx], wallet);
    await executeTrx([
        createPayloadAccountIx,
        createLedgerTokenAccountIx,
        transferIx,
        initiateBridgeWithFeeIx,
        closePayloadAccountIx,
    ], wallet);

    // sample tx: https://explorer.mayan.finance/tx/5ZWwApzKx5nGdXVq4JNycmqUbKtL8zA9Ua4GXnfks8o5BRyeu34oq7ehBeUCwjnLLEoNVM8YRb5YrUtVk3sHZgFe
    console.log('Bridge with fee executed:', wallet.publicKey.toString());
}

async function redeemWithFee() {
    // Initialize the Ethereum provider and wallet.
    const provider = new JsonRpcProvider(process.env.EVM_RPC as string);
    const evmWallet = new EvmWallet(process.env.EVM_PRIVATE_KEY as string, provider);
    const contract = new Contract('0x875d6d37ec55c8cf220b9e5080717549d8aa8eca', MayanCircleArtifact.abi, evmWallet);

    // Most parameters can be retrieved via the Mayan Explorer API.

    // For custom payloads, the hash of the payload data is used as a unique identifier.
    // Since the destination contract generates this hash itself, it ensures data integrity.
    const customPayloadHash = ethers.keccak256(Buffer.from('Hello, world!'));
    const bridgeParams = {
        payloadType: 2, // CUSTOM_PAYLOAD
        destAddr: '0x000000000000000000000000' + evmWallet.address.slice(2),
        gasDrop: 0,
        redeemFee: 0,
        burnAmount: BigInt(1000000),
        burnToken: '0x' + new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v').toBuffer().toString('hex'),
        customPayload: customPayloadHash,
    }
    const cctpMessage = '0x' + '000000000000000500000001000000000004f970a65fc943419a5ad590042fd67c9791fd015acf53a54cc823edb8ff81b9ed722e0000000000000000000000006b25532e1060ce10cc3b0a99e5683b91bfde6982000000000000000000000000875d6d37ec55c8cf220b9e5080717549d8aa8eca00000000c6fa7af3bedbad3a3d65f36aabc97431b1bbe4c2d2f6e0e47ca60203452f5d61000000000000000000000000875d6d37ec55c8cf220b9e5080717549d8aa8eca00000000000000000000000000000000000000000000000000000000000f4240b1cc2780210ec4174c1a1a775fbfdef5d3d416dc609d91f0278c2a5211b91740';
    const cctpAttestation = '0x' + '42d69fb155dd39e02cea5209a6839f22910c1cf890c155cfb254d730bbcf7cf23aadf8625146d055840e502f1b27f16fa8226ea269ac65f06aa798286c73a91b1b1684fe1e6798c7e07b1d12c7a0eb1e592017d43319bb38d78c7154a19d7886015ef52f91adfc2cc39df777ffad2bf5e1a13cf42bf24f58641e808ee180811c081b';
    const wormholeSignedVaa = '0x' + '01000000040d008274cb511e4a08753e60e2996a61b1ed312cea103fe620dce2b8e447b25b550a06147dcfa43a10dad9ba5e8914102c2dc3f77362f2b85655160e5965b44530b20002e0fcca30c03ca221e21877ec32e12cfecf6e06f3c669bd78691e86747fe9ae3a34ae3d115f2d4de511093420fccaf57c86df294850901817b3a69acb7b12b0440003281b2a9b490dc5c8056c925e50490ecae5b1f2ef222215f083fdd869aaa0ac66767a36637863c4b0de3d068d041a5f05fc48db344c308ca5975cf66829bc11ef01049d0382fec5ef6090d6e9cd958e2d96518dcc8111ba24dcf8659c37cb939a4b8132256b313838b341f392801dd2ea9c15a3103717d0021da6c060c7418e3218330106a8fa68d226049fe95840fadf98659e2e5e4f88141c518c820f3bc7cbdc647e6d086e7cd94892187b0e5a5038c54542f4747845c171b5515f7671a946d8a265670007b06a39d32d22934da2a3b51e377e1275b658ae15e88bc7dbafc47bcfe87146653a0f97245d7434dad19f5133ab769cba116e31d337fcc911d03b32e2ef7cc5870108e01b087e829bdb177124b15098a7906cb19e92331c8c6f5d525f6fdd4e430e957b367be7de02c5a2766ce98c434c83da696d5f826adb3e7a62a395e18187e51f0109a8fc00143090b897f8437e6099ed1163b7810906289215cb9d1695dcfe914a757778bdf922396afb0c12fca5a248b1490f9e64a4a8ed5434c603a79afbd1767b000aa7e73e5bfb1f08ea4f16ef6d23a50d59f82fa49a43f77e0360cfcfc04d9743d4636bbf1fc42cdc679fad876a5da3eb93acaf8ba3702fd4e1964d3a7601e68db0010bcafe5d0f43528bb2c92e3e3add8201c5058cdb06ea80932db14bda9b70279d6973c4bd96361e55690c7edf869615577abf8d12bfa58bd14e941d61bec11eb52e010e0e13d6e2eb9ec092a287e9ac03a3419d63381e6f342084a0b49cf03e7f3d70867d7f83ddfee3d7fc8c5b9ed2b3ff15f7b6f8058316c3bc3486b99c9ecf9c5ffe010f263e14101f1aa27ee163cbd8309f4913093f4ae452493cec6e753c88b976cf482ed75f71b615f9d4d0478e254fb6ed1081d3acd861e6e3d885d3b9d0e7946728011271b113f135748e42c2b369cc92d675515be9a2fac957a3d4d884453ff0a21cdb7f54056453d6f2a80dbe26ca4f2560d4dcbb268f182d1be07656f19300d8b6390067d3759200000000000115f7332bde6e694ea12a9b4fff9e610e36f24be8611f0066e661a8ccd74b02060000000000000543201c48ed148eb0b86fe00f3dc08b46a7df38bedfef16e558ef04f200b5229ac9f3';

    const redeemWithFeeTx = await contract.redeemWithFee(cctpMessage, cctpAttestation, wormholeSignedVaa, bridgeParams);
    console.log('Redeem with fee executed:', redeemWithFeeTx.hash);
}

// bridgeWithFee();
redeemWithFee();