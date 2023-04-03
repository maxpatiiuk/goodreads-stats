import '../../css/extension.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { ErrorBoundary } from '../Errors/ErrorBoundary';

// TODO: publish to webstore and post link here
// TODO: add screenshots
// TODO: remove unused code

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
