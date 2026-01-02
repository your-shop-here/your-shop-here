import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import type { TypedStartListening, TypedAddListener } from '@reduxjs/toolkit'

import type { ManagerState, ManagerDispatch } from './store'

export const listenerMiddleware = createListenerMiddleware()

export type AppStartListening = TypedStartListening<ManagerState, ManagerDispatch>

export const startAppListening =
  listenerMiddleware.startListening as AppStartListening

export const addAppListener = addListener as TypedAddListener<ManagerState, ManagerDispatch>
