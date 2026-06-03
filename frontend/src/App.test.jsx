import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the application without crashing', () => {
    // Basic test to ensure the environment is configured correctly
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // You can add an assertion here, e.g. checking for a specific element
    expect(document.body).toBeInTheDocument();
  });
});
