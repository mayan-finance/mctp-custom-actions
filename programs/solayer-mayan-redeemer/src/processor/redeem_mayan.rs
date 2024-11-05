use anchor_lang::prelude::*;
use anchor_spl::{
    token::{self, TokenAccount, Token, Mint},
    associated_token::AssociatedToken,
    token_interface
};
use anchor_lang::system_program;
use mctp::{
    cpi::{
        accounts::{RedeemWithFee, CctpClaim},
        redeem_with_fee,
    },
    RedeemWithFeeParams,
    program::Mctp,
    message_transmitter_legacy::program::MessageTransmitter,
    token_messenger_minter_legacy::program::TokenMessengerMinter,
};

use crate::{
    ID,
    MAIN_SEED_PREFIX,
    state::Ledger,
    error::SolayerMayanRedeemerError,
    solayer_susd_legacy::{
        program::UsdcPoolProgram as SolayerSUSD,
        cpi::{
            accounts::{Deposit},
            deposit
        },
    }
};
use solana_program::keccak;

#[derive(Accounts)]
#[instruction(nonce: u64, redeem_params: RedeemWithFeeParams)]
pub struct Redeem<'info> {
    #[account(
        init,
        payer = relayer,
        space = 8 + Ledger::INIT_SPACE,
        seeds = [
            Ledger::SEED_PREFIX,
            &keccak::hashv(&[&redeem_params.cctp_message]).0,
        ],
        bump,
    )]
    ledger: Box<Account<'info, Ledger>>,

    #[account(
        init_if_needed,
        payer = relayer,
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

    /// CHECK: this is empty pda
    #[account(
        seeds = [
            MAIN_SEED_PREFIX,
        ],
        bump,
        seeds::program = ID,
    )]
    main: UncheckedAccount<'info>,

    mint_deposit: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint_deposit,
        associated_token::authority = main,
    )]
    main_acc: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    relayer: Signer<'info>,

    #[account(
        mut,
        token::mint = mint_deposit,
    )]
    relayer_acc: Box<Account<'info, TokenAccount>>,

    /// CHECK: This should be check in custom payload hash
    user: UncheckedAccount<'info>,

    #[account(
        constraint = {
            require!(
                susd_mint.to_account_info().owner == &token_program_susd.key(),
                SolayerMayanRedeemerError::MintAndTokenProgramMismatch
            );
            true
        }
    )]
    susd_mint: InterfaceAccount<'info, token_interface::Mint>,

    /// CHECK: This is use for redeem_with_fee cpi
    vaa: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    mayan_caller: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    mayan_main: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_core_authority: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_core_message_transmitter: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    #[account(mut)]
    cctp_core_used_nonces: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_core_event_auth: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_token_token_messenger: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_token_remote_token_messenger: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    #[account(mut)]
    cctp_token_token_minter: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_token_local_token: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_token_token_pair: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    mayan_main_receiver_acc: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    #[account(mut)]
    cctp_token_custody: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_token_event_auth: UncheckedAccount<'info>,
    token_messenger_minter: Program<'info, TokenMessengerMinter>,
    message_transmitter: Program<'info, MessageTransmitter>,

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
    mctp: Program<'info, Mctp>,
    token_program: Program<'info, Token>,
    token_program_susd: Interface<'info, token_interface::TokenInterface>,
    associated_token_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>,
}

pub fn handle_redeem_mayan<'info>(
    ctx: Context<Redeem<'info>>,
    redeem_params: RedeemWithFeeParams,
    nonce: u64,
) -> Result<()> {
    let ledger = &mut ctx.accounts.ledger;
    let ledger_deposit_acc = &mut ctx.accounts.ledger_deposit_acc;
    let user = &ctx.accounts.user;
    let relayer = &ctx.accounts.relayer;
    let mint_deposit = &ctx.accounts.mint_deposit;
    let susd_mint = &ctx.accounts.susd_mint;
    let hash = keccak::hashv(&[
        &user.key().as_ref(),
        &mint_deposit.key().as_ref(),
        &susd_mint.key().as_ref(),
    ]).0;
    require!(hash == redeem_params.custom_payload, SolayerMayanRedeemerError::InvalidCustomPayload);

    let cctp_message_hash = keccak::hashv(&[&redeem_params.cctp_message]).0;
    let gas_drop = redeem_params.gas_drop;


    let redeemer_signer_seeds = &[
        MAIN_SEED_PREFIX,
        &[ctx.bumps.main],
    ];
    let redeemed_result = redeem_with_fee(
       CpiContext::new_with_signer(
           ctx.accounts.mctp.to_account_info(),
           RedeemWithFee {
               vaa: ctx.accounts.vaa.to_account_info(),
               cctp_claim: CctpClaim {
                   payer: relayer.to_account_info(),
                   caller: ctx.accounts.mayan_caller.to_account_info(),
                   main: ctx.accounts.mayan_main.to_account_info(),
                   cctp_mint: mint_deposit.to_account_info(),
                   cctp_core_authority: ctx.accounts.cctp_core_authority.to_account_info(),
                   cctp_core_message_transmitter: ctx.accounts.cctp_core_message_transmitter.to_account_info(),
                   cctp_core_used_nonces: ctx.accounts.cctp_core_used_nonces.to_account_info(),
                   cctp_core_event_auth: ctx.accounts.cctp_core_event_auth.to_account_info(),
                   cctp_token_token_messenger: ctx.accounts.cctp_token_token_messenger.to_account_info(),
                   cctp_token_remote_token_messenger: ctx.accounts.cctp_token_remote_token_messenger.to_account_info(),
                   cctp_token_token_minter: ctx.accounts.cctp_token_token_minter.to_account_info(),
                   cctp_token_local_token: ctx.accounts.cctp_token_local_token.to_account_info(),
                   cctp_token_token_pair: ctx.accounts.cctp_token_token_pair.to_account_info(),
                   cctp_receiver_acc: ctx.accounts.mayan_main_receiver_acc.to_account_info(),
                   cctp_token_custody: ctx.accounts.cctp_token_custody.to_account_info(),
                   cctp_token_event_auth: ctx.accounts.cctp_token_event_auth.to_account_info(),
                   token_messenger_minter: ctx.accounts.token_messenger_minter.to_account_info(),
                   message_transmitter: ctx.accounts.message_transmitter.to_account_info(),
               },
               dest: ctx.accounts.main_acc.to_account_info(),
               dest_acc: ctx.accounts.main_acc.to_account_info(),
               relayer_acc: ctx.accounts.relayer_acc.to_account_info(),
               token_program: ctx.accounts.token_program.to_account_info(),
               system_program: ctx.accounts.system_program.to_account_info(),
           },
          &[redeemer_signer_seeds],
       ),
       redeem_params,
    )?;

    let redeemed_amount: u64 = redeemed_result.get();

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.main_acc.to_account_info(),
                to: ledger_deposit_acc.to_account_info(),
                authority: ctx.accounts.main.to_account_info(),
            },
            &[redeemer_signer_seeds],
        ),
        redeemed_amount,
    )?;



    let ledger_signer_seeds = &[
        Ledger::SEED_PREFIX,
        &cctp_message_hash,
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
                token_program: ctx.accounts.token_program_susd.to_account_info(),
                token_program2022: ctx.accounts.token_program_susd.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            &[ledger_signer_seeds],
        ),
        nonce,
        redeemed_amount,
    )?;

    if gas_drop > 0 {
        // gas_drop in mayan is normalized by 8 decimals
        let gas_drop_denormalized = gas_drop.saturating_mul(10);
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.main.to_account_info(),
                    to: user.to_account_info(),
                },
                &[redeemer_signer_seeds],
            ),
            gas_drop_denormalized,
        )?;
    }

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

    ledger.set_inner(Ledger {
        bump: ctx.bumps.ledger,
        cctp_message_hash,
        user: user.key(),
    });

    Ok(())
}