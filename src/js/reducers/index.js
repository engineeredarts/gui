import { combineReducers, configureStore } from '@reduxjs/toolkit';

import appReducer from './appReducer';
import deploymentReducer from './deploymentReducer';
import deviceReducer from './deviceReducer';
import monitorReducer from './monitorReducer';
import organizationReducer from './organizationReducer';
import onboardingReducer from './onboardingReducer';
import releaseReducer from './releaseReducer';
import userReducer from './userReducer';
import { SET_SNACKBAR, UPLOAD_PROGRESS } from '../constants/appConstants';
import { RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS } from '../constants/organizationConstants';
import { USER_LOGOUT } from '../constants/userConstants';

const rootReducer = combineReducers({
  app: appReducer,
  devices: deviceReducer,
  deployments: deploymentReducer,
  monitor: monitorReducer,
  onboarding: onboardingReducer,
  organization: organizationReducer,
  releases: releaseReducer,
  users: userReducer
});

const sessionReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    state = undefined;
  }
  return rootReducer(state, action);
};

export const getConfiguredStore = config =>
  configureStore({
    ...config,
    reducer: sessionReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        immutableCheck: {
          ignoredPaths: ['app.cancelSource.token']
        },
        serializableCheck: {
          ignoredActions: [RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, SET_SNACKBAR, UPLOAD_PROGRESS],
          ignoredActionPaths: ['cancelSource.token', 'snackbar'],
          ignoredPaths: ['app.cancelSource.token', 'app.snackbar', 'organization.externalDeviceIntegrations']
        }
      })
  });

export default getConfiguredStore();
