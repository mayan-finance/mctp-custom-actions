import * as anchor from "@coral-xyz/anchor";
import {Program} from "@coral-xyz/anchor";
import {ExampleMayanRedeemer} from "../../target/types/example_mayan_redeemer";
import {Mctp} from "./mctp_types";
import {wallet, connection, executeTrx, chains, ZeroPermit} from './utils';
import {PublicKey} from "@solana/web3.js";
import {
    getAssociatedTokenAddressSync,
    createTransferInstruction,
    createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';
import {Contract, Wallet as EvmWallet, JsonRpcProvider, ethers} from "ethers";
import MayanCircleArtifact from "./MayanCircleArtifact";
import Erc20Artifact from "./ERC20Artifact";
import MayanForwarderArtifact from "./MayanForwarderArtifact";

// Based on `example-mayan-redeemer` program in this repo.

const Evm_USDC: { [index: string]: string} = {
    '43114': '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // avalanche
    '8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // base
}
const MAYAN_FORWARDER_CONTRACT = '0x337685fdaB40D39bd02028545a4FfA7D287cC3E2';
const MAYAN_MCTP_CONTRACT = '0x875d6d37ec55c8cf220b9e5080717549d8aa8eca';

// Set up the provider to use the local cluster.
anchor.setProvider(new anchor.AnchorProvider(connection, wallet));
const exampleRedeemer = anchor.workspace.ExampleMayanRedeemer as Program<ExampleMayanRedeemer>;
const mctp = anchor.workspace.Mctp as Program<Mctp>;

const redeemerProgramId = exampleRedeemer.programId;

async function bridgeWithFee() {
    // Initialize the Ethereum provider and wallet.
    const provider = new JsonRpcProvider(process.env.EVM_RPC as string);
    const evmWallet = new EvmWallet(process.env.EVM_PRIVATE_KEY as string, provider);
    const chainId = (await provider.getNetwork()).chainId
    const tokenIn = Evm_USDC[String(chainId)];
    const tokenContract = new Contract(tokenIn, Erc20Artifact.abi, evmWallet);
    const forwarderContract = new Contract(MAYAN_FORWARDER_CONTRACT, MayanForwarderArtifact.abi, evmWallet);
    const mctpContract = new Contract(MAYAN_MCTP_CONTRACT, MayanCircleArtifact.abi);

    const amountIn = BigInt('1000000'); // 1 USDC

    // Adjust this value if you want to incentivize a relayer to execute the redeem transaction
    const redeemFee = BigInt('0');

    // You can set gasDrop, which is the amount of gas the relayer will need to pay
    // to execute the redeem transaction on the destination chain.
    // It should be normalized to 8 decimals — for example, 100_000_000 represents 1 SOL.
    const gasDrop = BigInt('0');

    // Solana domain id
    const destDomain = 5;

    // This is specific to the destination program.
    // Typically, the destination address should be set to a program PDA.
    // For the MCTP program, this account must act as a signer on the destination chain.
    const [redeemer] = PublicKey.findProgramAddressSync(
        [Buffer.from("REDEEMER")],
        redeemerProgramId,
    );
    const destAddr = '0x' + redeemer.toBuffer().toString('hex'); // bytes32

    // creating the custom payload. in this example is gift recipient + gift message
    const giftRecipient = new PublicKey('Hha7h7Z8c8tkzLEMLy19mvnuXvEM9qSCZbRsrg7KzM5U');
    const giftMessage = Buffer.from('Happy Birthday');

    const MCTP_PAYLOAD_TYPE_CUSTOM_PAYLOAD = 2;
    const customPayloadBuffer = Buffer.concat([
        giftRecipient.toBuffer(),
        giftMessage,
    ]);
    const customPayload = '0x' + customPayloadBuffer.toString('hex'); // bytes

    const protocolData = mctpContract.interface.encodeFunctionData(
        'bridgeWithFee',
        [tokenIn, amountIn, redeemFee, gasDrop, destAddr, destDomain, MCTP_PAYLOAD_TYPE_CUSTOM_PAYLOAD, customPayload]
    );

    // Approving allowance for Mayan Forwarder then Mayan explorer could index the bridge
    const currentAllowance = await tokenContract.allowance(evmWallet.address, MAYAN_FORWARDER_CONTRACT);
    if (BigInt(currentAllowance) < amountIn) {
        console.log('approve ...');
        const approveTx = await tokenContract.approve(MAYAN_FORWARDER_CONTRACT, amountIn);
        await approveTx.wait();
        console.log('approved');
    } else {
        console.log('already approved');
    }

    const redeemWithFeeTx = await forwarderContract.forwardERC20(
        tokenIn, amountIn, ZeroPermit, MAYAN_MCTP_CONTRACT, protocolData);
    console.log('bridge with fee executed:', redeemWithFeeTx.hash);
    // sample: https://snowtrace.io/tx/0xc9382cc598b914cdc3f2bf8edbc05d40749e9168a9afc872e41c5344c7cdb99c
    // Mayan explorer: https://explorer.mayan.finance/tx/0xc9382cc598b914cdc3f2bf8edbc05d40749e9168a9afc872e41c5344c7cdb99c
}

/**
 * Executing the redeem transaction on the destination chain might seem challenging.
 * Feel free to reach out to us on Discord — we can help implement a relayer
 * for your destination program.
 */
async function redeemWithFee() {

    const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC

    // destination address of Mayan Mctp bridge
    const [redeemer] = PublicKey.findProgramAddressSync(
        [Buffer.from("REDEEMER")],
        redeemerProgramId,
    );

    const redeemerTokenAccount = getAssociatedTokenAddressSync(mint, redeemer, true);

    const createRedeemerTokenAccountIx = createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey, redeemerTokenAccount, redeemer, mint
    );

    const giftRecipient = new PublicKey('Hha7h7Z8c8tkzLEMLy19mvnuXvEM9qSCZbRsrg7KzM5U');

    const giftRecipientTokenAccount = getAssociatedTokenAddressSync(mint, giftRecipient, true);

    const createGiftRecipientTokenAccountIx = createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey, giftRecipientTokenAccount, giftRecipient, mint
    );

    const relayer = wallet.publicKey;

    const relayerTokenAccount = getAssociatedTokenAddressSync(mint, relayer, true);

    const createRelayerTokenAccountIx = createAssociatedTokenAccountIdempotentInstruction(
        wallet.publicKey, relayerTokenAccount, relayer, mint
    );

    // Posted Vaa on Solana chain should happen in separate transactions
    const vaa = new PublicKey('4EAHhAs7YvqaeNmMMcXCiuE7C7enVqo3crty3cheubUw');

    const [mayanCaller] = PublicKey.findProgramAddressSync(
        [Buffer.from('CALLER')],
        mctp.programId,
    );

    const [mayanMain] = PublicKey.findProgramAddressSync(
        [Buffer.from('MAIN')],
        mctp.programId,
    );

    const cctpCore = new PublicKey('CCTPmbSD7gX1bxKPAmg77w8oFzNFpaQiQUWD43TKaecd');
    const cctpToken = new PublicKey('CCTPiPYPc6AsJuwueEnWgSgucamXDZwBd53dQ11YiKX3');
    const [cctpCoreAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('message_transmitter_authority'), cctpToken.toBytes()],
        cctpCore,
    );
    const [cctpCoreMessageTransmitter] = PublicKey.findProgramAddressSync(
        [Buffer.from('message_transmitter')],
        cctpCore,
    );
}


bridgeWithFee();
// redeemWithFee();