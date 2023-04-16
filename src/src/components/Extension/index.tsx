import '../../css/extension.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { ErrorBoundary } from '../Errors/ErrorBoundary';
import { App } from './App';

/*
 * TODO: publish to webstore and post link in README.md
 * TODO: add screenshots
 */

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
