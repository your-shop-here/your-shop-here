import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { ManagerState, ManagerDispatch } from './store';

// Use instead of `useDispatch` and `useSelector` to provide types
export const useAppDispatch: () => ManagerDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<ManagerState> = useSelector
