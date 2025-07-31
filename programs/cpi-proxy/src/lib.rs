use anchor_lang::prelude::*;

pub mod processor;
pub use processor::*;

declare_id!("6u55Hqo1AsGMuJQ31VgNBfVhnpeszxXC4b6KzFaRU2JM");

#[program]
pub mod cpi_proxy {
    use super::*;

    pub fn foreign_program_invoker(ctx: Context<ForeignProgramInvoker>, payload: Vec<u8>) -> Result<()> {
        processor::handle_foreign_program_invoker(ctx, payload)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
