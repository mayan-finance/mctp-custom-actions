use anchor_lang::prelude::*;
use anchor_spl::token_interface;

use crate::{
    state::{Ledger},
    error::SolayerMayanRedeemerError,
};

#[derive(Accounts)]
pub struct CompleteDeposit<'info> {
    #[account(
        mut,
        seeds = [
            Ledger::SEED_PREFIX,
            &ledger.cctp_message_hash,
        ],
        bump = ledger.bump,
    )]
    ledger: Box<Account<'info, Ledger>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = ledger,
        associated_token::token_program = token_program,
    )]
    ledger_acc: Box<InterfaceAccount<'info, token_interface::TokenAccount>>,

    #[account(
        constraint = {
            require!(
                mint.to_account_info().owner == &token_program.key(),
                SolayerMayanRedeemerError::MintAndTokenProgramMismatch
            );
            true
        }
    )]
    mint: InterfaceAccount<'info, token_interface::Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = ledger.user,
        associated_token::token_program = token_program,
    )]
    user_acc: Box<InterfaceAccount<'info, token_interface::TokenAccount>>,

    relayer: Signer<'info>,

    token_program: Interface<'info, token_interface::TokenInterface>,
}

pub fn handle_complete_deposit<'info>(
    ctx: Context<CompleteDeposit<'info>>,
    try_close_ata: bool,
) -> Result<()> {
    let ledger = &ctx.accounts.ledger;
    let ledger_acc = &mut ctx.accounts.ledger_acc;

    let ledger_signer_seeds = &[
        Ledger::SEED_PREFIX,
        &ledger.cctp_message_hash,
        &[ledger.bump],
    ];

    token_interface::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token_interface::TransferChecked {
                from: ledger_acc.to_account_info(),
                to: ctx.accounts.user_acc.to_account_info(),
                authority: ledger.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
            &[ledger_signer_seeds],
        ),
        ledger_acc.amount,
        ctx.accounts.mint.decimals,
    )?;

    if try_close_ata {
        token_interface::close_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token_interface::CloseAccount {
                    account: ledger_acc.to_account_info(),
                    destination: ctx.accounts.relayer.to_account_info(),
                    authority: ledger.to_account_info(),
                },
                &[ledger_signer_seeds],
            ),
        )?;
    }

    Ok(())
}