use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, TokenAccount, Token, Mint},
    associated_token::AssociatedToken,
    token_interface
};


use crate::{
    LEDGER_SEED_PREFIX,
    error::SolayerMayanRedeemerError,
    state::LedgerSeeds,
    solayer_susd_legacy::{
        program::UsdcPoolProgram as SolayerSUSD,
        cpi::{
            accounts::{Deposit},
            deposit
        },
    }
};

#[derive(Accounts)]
#[instruction(ledger_seeds: LedgerSeeds, nonce: u64)]
pub struct DepositSolayer<'info> {
    /// CHECK: empty PDA
    #[account(
        mut,
        seeds = [
            LEDGER_SEED_PREFIX,
            ledger_seeds.user.as_ref(),
            ledger_seeds.mint_deposit.as_ref(),
            ledger_seeds.susd_mint.as_ref(),
        ],
        bump,
    )]
    ledger: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = mint_deposit,
        associated_token::authority = ledger,
    )]
    ledger_deposit_acc: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = relayer,
        associated_token::mint = susd_mint,
        associated_token::authority = ledger,
        associated_token::token_program = token_program_susd,
    )]
    ledger_susd_acc: Box<InterfaceAccount<'info, token_interface::TokenAccount>>,

    #[account(
        address = ledger_seeds.mint_deposit,
    )]
    mint_deposit: Box<Account<'info, Mint>>,

    #[account(mut)]
    relayer: Signer<'info>,

    #[account(
        address = ledger_seeds.susd_mint,
        constraint = {
            require!(
                susd_mint.to_account_info().owner == &token_program_susd.key(),
                SolayerMayanRedeemerError::MintAndTokenProgramMismatch
            );
            true
        }
    )]
    susd_mint: InterfaceAccount<'info, token_interface::Mint>,

    /// CHECK: This is use for solayer deposit cpi
    #[account(mut)]
    pool_usdc_main_vault: UncheckedAccount<'info>,
    /// CHECK: This is use for solayer deposit cpi
    #[account(mut)]
    pool: UncheckedAccount<'info>,
    /// CHECK: This is use for solayer deposit cpi
    #[account(mut)]
    deposit_proof: UncheckedAccount<'info>,

    solayer_susd: Program<'info, SolayerSUSD>,
    token_program: Program<'info, Token>,
    token_program_susd: Interface<'info, token_interface::TokenInterface>,
    associated_token_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>,
}

pub fn handle_deposit_solayer<'info>(
    ctx: Context<DepositSolayer<'info>>,
    ledger_seeds: LedgerSeeds,
    nonce: u64,
) -> Result<()> {
    let ledger = &mut ctx.accounts.ledger;
    let ledger_deposit_acc = &mut ctx.accounts.ledger_deposit_acc;
    let relayer = &ctx.accounts.relayer;
    let mint_deposit = &ctx.accounts.mint_deposit;
    let susd_mint = &ctx.accounts.susd_mint;

    let amount: u64 = ledger_deposit_acc.amount;


    let ledger_signer_seeds = &[
        LEDGER_SEED_PREFIX,
        &ledger_seeds.user.to_bytes(),
        &ledger_seeds.mint_deposit.to_bytes(),
        &ledger_seeds.susd_mint.to_bytes(),
        &[ctx.bumps.ledger],
    ];

    deposit(
        CpiContext::new_with_signer(
            ctx.accounts.solayer_susd.to_account_info(),
            Deposit {
                signer: ledger.to_account_info(),
                usdc_mint: mint_deposit.to_account_info(),
                signer_usdc_token_account: ledger_deposit_acc.to_account_info(),
                pool_usdc_main_vault: ctx.accounts.pool_usdc_main_vault.to_account_info(),
                susd_mint: susd_mint.to_account_info(),
                signer_susd_vault: ctx.accounts.ledger_susd_acc.to_account_info(),
                pool: ctx.accounts.pool.to_account_info(),
                deposit_proof: ctx.accounts.deposit_proof.to_account_info(),
                associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                token_program2022: ctx.accounts.token_program_susd.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            &[ledger_signer_seeds],
        ),
        nonce,
        amount,
    )?;

    ledger_deposit_acc.reload()?;

    if ledger_deposit_acc.amount == 0 {
        token::close_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::CloseAccount {
                    account: ledger_deposit_acc.to_account_info(),
                    destination: relayer.to_account_info(),
                    authority: ledger.to_account_info(),
                },
                &[ledger_signer_seeds],
            ),
        )?;
    }

    Ok(())
}