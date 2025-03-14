use anchor_lang::prelude::*;

mod processor;
mod error;

use processor::*;

declare_id!("DwMLtdtJqJQkHzNcrdTBuWHJByJfgpKBnvFvzyKdy3cU");

#[program]
pub mod mctp_payload_writer {
    use super::*;

    pub fn create_simple(ctx: Context<CreateSimple>, nonce: u16, data: Vec<u8>) -> Result<()> {
        handle_create_simple(ctx, nonce, data)
    }

    pub fn close(ctx: Context<ClosePayload>, nonce: u16) -> Result<()> {
        handle_close(ctx, nonce)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
