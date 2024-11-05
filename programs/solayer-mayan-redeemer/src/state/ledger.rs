use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct Ledger {
    pub bump: u8,
    pub cctp_message_hash: [u8; 32],
    pub user: Pubkey,
}

impl Ledger {
    pub const SEED_PREFIX: &'static [u8] = b"LEDGER";
}
