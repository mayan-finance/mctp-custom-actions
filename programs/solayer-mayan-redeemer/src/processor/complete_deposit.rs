use anchor_lang::prelude::*;
use anchor_spl::token_interface;

use crate::{
    state::{LedgerSeeds},
    error::SolayerMayanRedeemerError,
    LEDGER_SEED_PREFIX
};



#[derive(Accounts)]
#[instruction(ledger_seeds: LedgerSeeds, try_close_ata: bool)]
pub struct CompleteDeposit<'info> {
    /// CHECK: empty PDA
    #[account(
        seeds = [
            LEDGER_SEED_PREFIX,
            &ledger_seeds.user.to_bytes(),
            &ledger_seeds.mint_deposit.to_bytes(),
            &ledger_seeds.susd_mint.to_bytes(),
        ],
        bump,
    )]
    ledger: UncheckedAccount<'info>,

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

    /// CHECK: this check by ledger seeds
    #[account(
        address = ledger_seeds.user,
    )]
    user: UncheckedAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = ledger_seeds.user,
        associated_token::token_program = token_program,
    )]
    user_acc: Box<InterfaceAccount<'info, token_interface::TokenAccount>>,


    relayer: Signer<'info>,

    token_program: Interface<'info, token_interface::TokenInterface>,
}

pub fn handle_complete_deposit<'info>(
    ctx: Context<CompleteDeposit<'info>>,
    ledger_seeds: LedgerSeeds,
    try_close_ata: bool,
) -> Result<()> {
    let ledger = &ctx.accounts.ledger;
    let ledger_acc = &mut ctx.accounts.ledger_acc;

    if ctx.accounts.mint.key() == ledger_seeds.mint_deposit {
        require!(ctx.accounts.user.is_signer, SolayerMayanRedeemerError::UserMustSignToWithdrawDepositMint);
    }

    let ledger_signer_seeds = &[
        LEDGER_SEED_PREFIX,
        &ledger_seeds.user.to_bytes(),
        &ledger_seeds.mint_deposit.to_bytes(),
        &ledger_seeds.susd_mint.to_bytes(),
        &[ctx.bumps.ledger],
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