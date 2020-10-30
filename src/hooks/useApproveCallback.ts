import { MaxUint256 } from '@ethersproject/constants'
//import { BigNumber } from '@ethersproject/bignumber'
//import { TransactionResponse } from '@ethersproject/providers'
import { Trade, TokenAmount, CurrencyAmount, HARMONY } from '@swoop-exchange/sdk'
import { useCallback, useMemo, useState } from 'react'
import { ROUTER_ADDRESS } from '../constants'
import { useTokenAllowance } from '../data/Allowances'
import { getTradeVersion, useV1TradeExchangeAddress } from '../data/V1'
import { Field } from '../state/swap/actions'
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
//import { calculateGasMargin } from '../utils'
import { useTokenContract } from './useContract'
import { Version } from './useToggledVersion'

import { useActiveHmyReact } from '../hooks'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED
}

type approvedTokens = Record<string, boolean>

/*const makeHashFromCurrencyAmount = (currencyAmount: CurrencyAmount | undefined) => {
  if (!(currencyAmount instanceof TokenAmount)) {
     return ''
  }

  return currencyAmount.denominator.toString() + currencyAmount.currency.symbol
}*/

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account, wrapper } = useActiveHmyReact()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  const [approveTxSent, setApproveTxSent] = useState<boolean>(false)


  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency === HARMONY) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    if (approveTxSent && !currentAllowance.lessThan(amountToApprove)) {
      setApproveTxSent( false)
    }

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? (pendingApproval || approveTxSent)
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender, approveTxSent])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false
    // There seems to be an issue with gas estimations - the estimation appear to be correct but the txs won't properly propagate/get accepted
    // When using the default high gas limit of 6721900 txs will get confirmed tho
    /*const estimatedGas = await tokenContract.methods.approve(spender, MaxUint256.toString()).estimateGas(wrapper.gasOptionsForEstimation()).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.methods.approve(spender, amountToApprove.raw.toString()).estimateGas(wrapper.gasOptionsForEstimation())
    })*/

    let gasOptions = wrapper.gasOptions();
    //gasOptions.gasLimit = calculateGasMargin(BigNumber.from(estimatedGas)).toNumber();

    setApproveTxSent(true)
    return tokenContract.methods
      .approve(spender, useExact ? amountToApprove.raw.toString() : MaxUint256.toString()).send(gasOptions)
      .then((response: any) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender }
        })
      })
      .catch((error: Error) => {
        setApproveTxSent( false)
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, wrapper, addTransaction])

  return [approvalState, approve]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade, allowedSlippage = 0) {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage]
  )
  const tradeIsV1 = getTradeVersion(trade) === Version.v1
  const v1ExchangeAddress = useV1TradeExchangeAddress(trade)
  return useApproveCallback(amountToApprove, tradeIsV1 ? v1ExchangeAddress : ROUTER_ADDRESS)
}