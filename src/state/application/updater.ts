import { useCallback, useEffect, useState } from 'react'
import useDebounce from '../../hooks/useDebounce'
import useIsWindowVisible from '../../hooks/useIsWindowVisible'
import { updateBlockNumber } from './actions'
import { useDispatch } from 'react-redux'

import { useActiveHmyReact } from '../../hooks'

export default function Updater(): null {
  const { chainId, library } = useActiveHmyReact();
  const dispatch = useDispatch()

  const windowVisible = useIsWindowVisible()

  const [state, setState] = useState<{ chainId: number | undefined; blockNumber: number | null }>({
    chainId,
    blockNumber: null
  })

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState(state => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number') return { chainId, blockNumber }
          return { chainId, blockNumber: Math.max(blockNumber, state.blockNumber) }
        }
        return state
      })
    },
    [chainId, setState]
  )

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined

    let timeoutId: any
    setState({ chainId, blockNumber: null })

    const getLatestBlockNumber = () => {
    library
      .blockchain
      .getBlockNumber()
      //@ts-ignore
      .then(r => +library.utils.hexToNumber(r.result))
      .then(blockNumberCallback)
      .catch((error: any) => console.error(`Failed to get block number for chainId: ${chainId}`, error))
      .finally(() => timeoutId = setTimeout(getLatestBlockNumber, 3000)) // Use 3 seconds for Harmony
    }

    getLatestBlockNumber()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [dispatch, chainId, library, blockNumberCallback, windowVisible])

  const debouncedState = useDebounce(state, 100)

  useEffect(() => {
    if (!debouncedState.chainId || !debouncedState.blockNumber || !windowVisible) return
    dispatch(updateBlockNumber({ chainId: debouncedState.chainId, blockNumber: debouncedState.blockNumber }))
  }, [windowVisible, dispatch, debouncedState.blockNumber, debouncedState.chainId])

  return null
}
