require('dotenv').config();
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import {
    SystemProgram
} from "@solana/web3.js";

const keypair = anchor.web3.Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_PRIVATE_KEY as string));
export const connection = new anchor.web3.Connection(process.env.SOLANA_RPC as string, 'confirmed');

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export const wallet: anchor.Wallet = {
    payer: keypair,
    publicKey: keypair.publicKey,
    signTransaction: async <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(transaction: T): Promise<T> => {
        if (transaction instanceof anchor.web3.Transaction) {
            transaction.partialSign(keypair);
        } else {
            transaction.sign([keypair]);
        }
        return transaction;
    },
    signAllTransactions: async <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(transactions: T[]): Promise<T[]> => {
        transactions.forEach(transaction => {
            if (transaction instanceof anchor.web3.Transaction || !(transaction instanceof anchor.web3.VersionedTransaction)) {
                transaction.partialSign(keypair);
            } else {
                transaction.sign([keypair]);
            }
        });
        return transactions;
    }
}

export async function executeTrx(instructions: anchor.web3.TransactionInstruction[], signer: anchor.Wallet, extraSigner?: anchor.web3.Keypair): Promise<string> {
    const { blockhash: blockhashSim, lastValidBlockHeight: lastValidBlockHeightSim } = await connection.getLatestBlockhash();
    let messageV0Simulate = anchor.web3.MessageV0.compile({
        payerKey: signer.payer.publicKey,
        recentBlockhash: blockhashSim,
        instructions,
    })
    let trx= new anchor.web3.VersionedTransaction(messageV0Simulate);

    console.log('===>')

    if (extraSigner) {
        trx.sign([extraSigner]);
    }

    let signedTrx = await signer.signTransaction(trx);

    const simulate = await connection.simulateTransaction(signedTrx);
    if (simulate.value.err) {
        console.log(simulate, simulate.value.logs);
        throw new Error(`Transaction simulation failed`);
    }
    const computeUnits = simulate.value.unitsConsumed! * 1.2;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const messageV0 = anchor.web3.MessageV0.compile({
        payerKey: signer.payer.publicKey,
        recentBlockhash: blockhash,
        instructions: [
            anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
                units: computeUnits
            }),
            anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 200000
            }),
            ...instructions,
        ],
    });
    trx = new anchor.web3.VersionedTransaction(messageV0);

    if (extraSigner) {
        trx.sign([extraSigner]);
    }

    signedTrx = await signer.signTransaction(trx);

    const txHash = await connection.sendRawTransaction(signedTrx.serialize());
    // const txHash = await connection.sendRawTransaction(signedTrx.serialize(), { skipPreflight: true });

    for (let i = 0; i < 10; i++) {
        await wait(1000);
        connection.sendRawTransaction(signedTrx.serialize(), { skipPreflight: true });
    }

    console.log({txHash});

    return txHash;
}

type ChainName = 'solana'
    | 'ethereum' | 'bsc' | 'polygon' | 'avalanche' | 'arbitrum' | 'optimism' | 'base' | 'aptos' | 'sui' | 'unichain';

export const chains: { [index in ChainName]: number }  = {
    solana: 1,
    ethereum: 2,
    bsc: 4,
    polygon: 5,
    avalanche: 6,
    arbitrum: 23,
    optimism: 24,
    base: 30,
    aptos: 22,
    sui: 21,
    unichain: 44,
};

type Erc20Permit = {
    value: bigint,
    deadline: number,
    v: number,
    r: string,
    s: string,
}

export const ZeroPermit: Erc20Permit = {
    value: BigInt(0),
    deadline: 0,
    v: 0,
    r: `0x${SystemProgram.programId.toBuffer().toString('hex')}`,
    s: `0x${SystemProgram.programId.toBuffer().toString('hex')}`,
}