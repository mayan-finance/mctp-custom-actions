
use anchor_lang::prelude::*;
use mctp::RedeemWithFeeParams;
mod error;
mod state;
use state::*;

mod processor;
use processor::*;


declare_id!("GZTtM9WWN1kJuXHJBNRVLjc76dSPG44ExfyieLQjR8sW");
declare_program!(solayer_susd_legacy);


const MAIN_SEED_PREFIX: &'static [u8] = b"MAIN";
const LEDGER_SEED_PREFIX: &'static [u8] = b"LEDGER";
#[program]
pub mod solayer_mayan_redeemer {
    use super::*;

    pub fn redeem_mayan(
        ctx: Context<Redeem>,
        redeem_params: RedeemWithFeeParams,
    ) -> Result<()> {
        processor::handle_redeem_mayan(ctx, redeem_params)
    }

    pub fn deposit_solayer(
        ctx: Context<DepositSolayer>,
        ledger_seeds: LedgerSeeds,
        nonce: u64,
    ) -> Result<()> {
        processor::handle_deposit_solayer(ctx, ledger_seeds, nonce)
    }

    pub fn complete_deposit(
        ctx: Context<CompleteDeposit>,
        ledger_seeds: LedgerSeeds,
        try_close_ata: bool,
    ) -> Result<()> {
        processor::handle_complete_deposit(ctx, ledger_seeds, try_close_ata)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
