import { configureStore } from '@reduxjs/toolkit';

import { reducer as apiReducer, middleware as apiMiddleware } from './api';
import { reducer as appReducer } from './app';
import { reducer as highlightReducer } from './highlight';
import { reducer as mainViewReducer } from './mainView';
import { reducer as runsReducer } from './runs';
import { reducer as runTabsReducer } from './runTabs';
import { reducer as selectionReducer } from './selection';

const store = configureStore({
  reducer: {
    api: apiReducer,
    app: appReducer,
    highlight: highlightReducer,
    mainView: mainViewReducer,
    runs: runsReducer,
    runTabs: runTabsReducer,
    selection: selectionReducer
  },

  middleware: defaultMiddleware =>
    defaultMiddleware({
      serializableCheck: false
    }).concat(apiMiddleware)
});

export type State = ReturnType<typeof store.getState>;

export default store;
