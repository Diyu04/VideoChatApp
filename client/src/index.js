import React from 'react';
import ReactDOM from 'react-dom'; // render react components into dom

import App from './App';
import { ContextProvider } from './Context';

import './styles.css';

ReactDOM.render(
  <ContextProvider>
    <App />
  </ContextProvider>,
  document.getElementById('root'), // mounting into dom at the element with id root
);
