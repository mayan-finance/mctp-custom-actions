use anchor_lang::prelude::*;
use solana_program::{instruction::{Instruction, AccountMeta}, program::invoke};
use crate::{
    ID,
};

#[error_code]
pub enum ErrorCode {
    #[msg("The target program is not in the whitelist")]
    ProgramNotWhitelisted,
    #[msg("Cannot invoke this program itself")]
    CantInvokeSelf,
    #[msg("Cross-program invocation failed")]
    CpiInvokeFailed,
}

const WHITELISTED_PROGRAMS: [Pubkey; 9] = [
    pubkey!("11111111111111111111111111111111"),
    pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    pubkey!("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
    pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
    pubkey!("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"),
    pubkey!("B96dV3Luxzo6SokJx3xt8i5y8Mb7HRR6Eec8hCjJDT69"),
    pubkey!("DwMLtdtJqJQkHzNcrdTBuWHJByJfgpKBnvFvzyKdy3cU"),
    pubkey!("dkpZqrxHFrhziEMQ931GLtfy11nFkCsfMftH9u6QwBU"),
    pubkey!("BLZRi6frs4X4DNLw56V4EXai1b6QVESN1BhHBTYM9VcY"),
];

// Accounts context: only the target program is explicitly declared
#[derive(Accounts)]
pub struct ForeignProgramInvoker<'info> {
    /// CHECK: must be executable; validated at runtime
    #[account(executable)]
    pub target_program: AccountInfo<'info>,
    // any further accounts passed in will be available in ctx.remaining_accounts
}

pub fn handle_foreign_program_invoker(
    ctx: Context<ForeignProgramInvoker>,
    data: Vec<u8>,
) -> Result<()> {
    let program_id = ctx.accounts.target_program.key();

    require!(WHITELISTED_PROGRAMS.contains(&program_id), ErrorCode::ProgramNotWhitelisted);
    require!(program_id != ID, ErrorCode::CantInvokeSelf);

    let accounts_meta: Vec<AccountMeta> = ctx
        .remaining_accounts
        .iter()
        .skip(1) // skip the first account which is the target program
        .map(|acc| AccountMeta {
            pubkey: *acc.key,
            is_signer: acc.is_signer,
            is_writable: acc.is_writable,
        })
        .collect();

    let ix = Instruction {
        program_id,
        accounts: accounts_meta,
        data,
    };

    invoke(&ix, ctx.remaining_accounts)
        .map_err(|_| error!(ErrorCode::CpiInvokeFailed))?;

    Ok(())
}