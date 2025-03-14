use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClosePayload<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is the PDA payload account that will be closed.
    #[account(mut)]
    pub payload: UncheckedAccount<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid PDA for payload")]
    InvalidPda,
}

/// Closes the “simple” payload account by transferring all its lamports (i.e. rent) to the payer.
///
/// The PDA is expected to be derived from:
///   - the literal seed "PAYLOAD"
///   - the payer’s public key
///   - the nonce (u16) provided in the instruction parameters
///
/// Steps:
/// 1. Verify that the payload account is the correct PDA.
/// 2. Transfer all lamports from the payload account to the payer.
/// 3. Optionally, clear the account data.
pub fn handle_close(ctx: Context<ClosePayload>, nonce: u16) -> Result<()> {
    let payload_info = ctx.accounts.payload.to_account_info();
    let payer_info = ctx.accounts.payer.to_account_info();

    // Verify the payload account is the expected PDA.
    let (expected_pda, _bump) = Pubkey::find_program_address(
        &[b"PAYLOAD", payer_info.key.as_ref(), &nonce.to_le_bytes()],
        ctx.program_id,
    );
    if expected_pda != *payload_info.key {
        return Err(ErrorCode::InvalidPda.into());
    }

    // Transfer all lamports from the payload account to the payer.
    **payer_info.lamports.borrow_mut() = payer_info
        .lamports()
        .checked_add(payload_info.lamports())
        .unwrap();
    **payload_info.lamports.borrow_mut() = 0;

    // Clear out the account data (optional step).
    let mut data = payload_info.data.borrow_mut();
    let data_mut: &mut [u8] = &mut *data;
    for byte in data_mut.iter_mut() {
        *byte = 0;
    }

    Ok(())
}
