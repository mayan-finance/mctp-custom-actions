use anchor_lang::prelude::*;
use anchor_spl::{token::{self, TokenAccount, Token}};
use anchor_lang::system_program;
use mctp::{
    cpi::{
        accounts::{RedeemWithFeeCustomPayload, CctpClaim},
        redeem_with_fee_custom_payload,
    },
    RedeemWithFeeParams,
    program::Mctp,
    message_transmitter_legacy::program::MessageTransmitter,
    token_messenger_minter_legacy::program::TokenMessengerMinter,
};

use crate::{
    ID,
    MAIN_SEED_PREFIX,
    LEDGER_SEED_PREFIX,
    error::SolayerMayanRedeemerError,
};
use solana_program::keccak;

#[derive(Accounts)]
pub struct Redeem<'info> {
    /// CHECK: empty PDA
    #[account(
        seeds = [
            LEDGER_SEED_PREFIX,
            user.key().as_ref(),
            mint_deposit.key().as_ref(),
            susd_mint.key().as_ref(),
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

    /// CHECK: this is empty pda
    #[account(
        mut,
        seeds = [
            MAIN_SEED_PREFIX,
        ],
        bump,
        seeds::program = ID,
    )]
    main: UncheckedAccount<'info>,

    /// CHECK: This is use for redeem_with_fee cpi
    mint_deposit: UncheckedAccount<'info>,

    /// CHECK: This is use for redeem_with_fee cpi
    susd_mint: UncheckedAccount<'info>,

    /// CHECK: validation with custom payload hash
    #[account(mut)]
    user: UncheckedAccount<'info>,

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
    #[account(mut)]
    cctp_token_local_token: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_token_token_pair: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    #[account(mut)]
    mayan_main_receiver_acc: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    #[account(mut)]
    cctp_token_custody: UncheckedAccount<'info>,
    /// CHECK: This is use for redeem_with_fee cpi
    cctp_token_event_auth: UncheckedAccount<'info>,
    token_messenger_minter: Program<'info, TokenMessengerMinter>,
    message_transmitter: Program<'info, MessageTransmitter>,

    mctp: Program<'info, Mctp>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
}

pub fn handle_redeem_mayan<'info>(
    ctx: Context<Redeem<'info>>,
    redeem_params: RedeemWithFeeParams,
) -> Result<()> {
    let ledger_deposit_acc = &mut ctx.accounts.ledger_deposit_acc;

    let relayer = &ctx.accounts.relayer;
    let mint_deposit = &ctx.accounts.mint_deposit;
    let hash = keccak::hashv(&[
        ctx.accounts.user.key().as_ref(),
        &mint_deposit.key().as_ref(),
        ctx.accounts.susd_mint.key().as_ref(),
    ]).0;

    require!(hash == redeem_params.custom_payload, SolayerMayanRedeemerError::InvalidCustomPayload);

    let gas_drop = redeem_params.gas_drop;


    msg!("Redeeming Mayan");
    let redeemer_signer_seeds = &[
        MAIN_SEED_PREFIX,
        &[ctx.bumps.main],
    ];
    let redeemed_result = redeem_with_fee_custom_payload(
       CpiContext::new_with_signer(
           ctx.accounts.mctp.to_account_info(),
           RedeemWithFeeCustomPayload {
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
               dest: ctx.accounts.main.to_account_info(),
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

    if gas_drop > 0 {
        // gas_drop in mayan is normalized by 8 decimals
        let gas_drop_denormalized = gas_drop.saturating_mul(10);
        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.main.to_account_info(),
                    to: ctx.accounts.user.to_account_info(),
                },
                &[redeemer_signer_seeds],
            ),
            gas_drop_denormalized,
        )?;
    }

    Ok(())
}