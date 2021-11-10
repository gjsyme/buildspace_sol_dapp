use anchor_lang::prelude::*;

declare_id!("GfUN6idVPy7R3Rg4Ymw2ZDpo3PShKgzRQXdd7sPrBW9t");

#[program]
pub mod myepicproject {
  use super::*;
  pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_gifs= 0;
    Ok(())
  }

  pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult{
    let base_account = &mut ctx.accounts.base_account;
    let user = &mut ctx.accounts.user;

    let item = ItemStruct{
      gif_link: gif_link.to_string(),
      user_address: *user.to_account_info().key,
      votes: 0,
    };

    base_account.gif_list.push(item);
    base_account.total_gifs+=1;
    Ok(())
  }

  pub fn upvote_gif(ctx: Context<GifVote>, index: u8) -> ProgramResult{
    let base_account = &mut ctx.accounts.base_account;
    
    base_account.gif_list[index as usize].votes+=1;
    Ok(())
  }

  pub fn downvote_gif(ctx: Context<GifVote>, index: u8) -> ProgramResult{
    let base_account = &mut ctx.accounts.base_account;
    
    base_account.gif_list[index as usize].votes-=1;
    Ok(())
  }

  pub fn send_tip(ctx: Context<UserTip>, lamports: u64) -> ProgramResult {
    let sender = &mut ctx.accounts.sender;
    let receiver = &mut ctx.accounts.receiver;

    let tip_instr = anchor_lang::solana_program::system_instruction::transfer(
      &sender.key(),
      &receiver.key(),
      lamports
    );

    anchor_lang::solana_program::program::invoke(
      &tip_instr,
      &[
        sender.to_account_info(),
        receiver.to_account_info()
      ]
    )
  }
}

#[derive(Accounts)]
pub struct StartStuffOff<'info>{
  #[account(init, payer=user, space=9000)]
  pub base_account: Account<'info, BaseAccount>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info>{
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
  pub user: Signer<'info>
}

#[derive(Accounts)]
pub struct GifVote<'info>{
  #[account(mut)]
  pub base_account: Account<'info, BaseAccount>,
}

#[derive(Accounts)]
pub struct UserTip<'info>{
  #[account(mut)]
  sender: Signer<'info>,
  #[account(mut)]
  receiver: AccountInfo<'info>,
  system_program: Program<'info, System>
}

#[derive(Debug,Clone,AnchorSerialize,AnchorDeserialize)]
pub struct ItemStruct{
  pub gif_link: String,
  pub user_address: Pubkey,
  pub votes: i8,
}

#[account]
pub struct BaseAccount{
  pub total_gifs: u64,
  pub gif_list: Vec<ItemStruct>,
}