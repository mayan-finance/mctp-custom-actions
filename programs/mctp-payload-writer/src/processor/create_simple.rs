use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::invoke_signed,
    system_instruction,
    rent::Rent,
};
use crate::error::MctpPayloadWriterError;

#[derive(Accounts)]
pub struct CreateSimple<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is the PDA payload account. It must not exist prior to creation.
    #[account(mut)]
    pub payload: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

/// Creates a new “simple” account with the given data.
///
/// The PDA is derived from:
///   - the literal seed "PAYLOAD"
///   - the payer’s public key
///   - the nonce (u16) provided in the instruction parameters
///
/// Steps:
/// 1. Verify that the payload account does not already exist (its lamports should be zero).
/// 2. Verify that the provided payload account matches the PDA derived from the seeds.
/// 3. Compute the rent-exempt balance for the space needed (length = data.len()).
/// 4. Call the system program’s `create_account` via CPI (with the PDA seeds as signer).
/// 5. Write the provided data into the newly created account.
pub fn handle_create_simple(ctx: Context<CreateSimple>, nonce: u16, data: Vec<u8>) -> Result<()> {
    let payload_account = ctx.accounts.payload.to_account_info();
    let payer_info = ctx.accounts.payer.to_account_info();

    // Ensure the payload account does not exist yet.
    if payload_account.lamports() > 0 {
        return Err(MctpPayloadWriterError::AlreadyInitialized.into());
    }

    // Verify that the payload account is the expected PDA.
    let (expected_pda, bump) = Pubkey::find_program_address(
        &[b"PAYLOAD", payer_info.key.as_ref(), &nonce.to_le_bytes()],
        ctx.program_id,
    );
    if expected_pda != *payload_account.key {
        return Err(MctpPayloadWriterError::InvalidPda.into());
    }

    // Compute required lamports for rent exemption.
    let rent = Rent::get()?;
    let space = data.len();
    let lamports = rent.minimum_balance(space);

    // Prepare the PDA seeds for signing.
    let seeds = &[b"PAYLOAD", payer_info.key.as_ref(), &nonce.to_le_bytes(), &[bump]];

    // Create the account via the system program.
    let ix = system_instruction::create_account(
        payer_info.key,
        payload_account.key,
        lamports,
        space as u64,
        ctx.program_id,
    );
    invoke_signed(
        &ix,
        &[
            payer_info.clone(),
            payload_account.clone(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[seeds],
    )?;

    // Write the provided data into the payload account.
    let mut account_data = payload_account.data.borrow_mut();
    account_data[..data.len()].copy_from_slice(&data);

    Ok(())
}
