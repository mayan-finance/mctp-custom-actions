
use anchor_lang::prelude::*;
use mctp::RedeemWithFeeParams;
mod error;
mod state;

mod processor;
use processor::*;


declare_id!("GZTtM9WWN1kJuXHJBNRVLjc76dSPG44ExfyieLQjR8sW");
declare_program!(solayer_susd_legacy);


const MAIN_SEED_PREFIX: &'static [u8] = b"MAIN";

#[program]
pub mod solayer_mayan_redeemer {
    use super::*;

    pub fn redeem(
        ctx: Context<Redeem>,
        redeem_params: RedeemWithFeeParams,
        nonce: u64,
    ) -> Result<()> {
        processor::handle_redeem_mayan(ctx, redeem_params, nonce)
    }

    pub fn complete_deposit(
        ctx: Context<CompleteDeposit>,
        try_close_ata: bool,
    ) -> Result<()> {
        processor::handle_complete_deposit(ctx, try_close_ata)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
