use anchor_lang::prelude::*;

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LedgerSeeds {
    pub user: Pubkey,
    pub mint_deposit: Pubkey,
    pub susd_mint: Pubkey,
}
