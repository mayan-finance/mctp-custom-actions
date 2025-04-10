use anchor_lang::prelude::*;
use mctp::RedeemWithFeeParams;
mod processor;
use processor::*;

declare_id!("64GF47az6wbopzshLNaeQe57LYkHyAU95ihozWQ5zrFg");

/// This simple PDA must be passed to the Mayan redeem_with_fee instruction.
/// On the source chain, the addr_dest should be set to this PDA.
/// You can use any PDA with any seed phrases; the redeem_with_fee instruction requires
/// this account as a signer to verify that the instruction is called through the dest_addr,
/// thereby granting access to the custom payload.
pub const REDEEMER_SEED: &[u8] = b"REDEEMER";

#[program]
pub mod example_mayan_redeemer {
    use super::*;

    pub fn redeem(ctx: Context<Redeem>, redeem_params: RedeemWithFeeParams, gift_message: Vec<u8>) -> Result<()> {
        processor::handle_redeem(ctx, redeem_params, gift_message)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
