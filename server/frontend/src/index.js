// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './store/Index';
import backendRequestMiddleware from './store/BackendRequestMiddleware';
import { Provider } from 'react-redux';

import { GoogleOAuthProvider } from '@react-oauth/google';


// Create redux store
export const store = createStore(rootReducer, applyMiddleware(backendRequestMiddleware));

// Attempt auto sign in
const action = {
  type: 'BR_INIT',
  store: 'auth',
  label: 'AUTO_SIGN_IN',
  request: {},
};

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';


store.dispatch(action).finally(() =>
  ReactDOM.render(
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
      <App />
      </GoogleOAuthProvider>
    </Provider>,
    document.getElementById('root'),
  ),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
