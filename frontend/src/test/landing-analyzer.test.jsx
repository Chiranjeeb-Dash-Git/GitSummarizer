import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LandingAnalyzer from '../components/landing/LandingAnalyzer.tsx';

afterEach(cleanup);

function Destination() {
  const location = useLocation();
  return <p>{location.search}</p>;
}

describe('landing analyzer', () => {
  it('reports an invalid input and clears the error when edited', () => {
    render(<MemoryRouter><LandingAnalyzer /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    const input = screen.getByRole('textbox', { name: 'GitHub repository URL' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a GitHub link');
    fireEvent.change(input, { target: { value: 'vitejs/vite' } });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('navigates with the selected mode and audience', () => {
    render(<MemoryRouter initialEntries={['/']}><Routes><Route path="/" element={<LandingAnalyzer />} /><Route path="/read" element={<Destination />} /></Routes></MemoryRouter>);
    fireEvent.change(screen.getByRole('textbox', { name: 'GitHub repository URL' }), { target: { value: 'vitejs/vite' } });
    const mode = screen.getByRole('button', { name: /Commit Overview/ });
    fireEvent.click(mode);
    fireEvent.click(screen.getByRole('button', { name: /Maintainers/ }));
    expect(mode).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    expect(screen.getByText('?input=vitejs%2Fvite&kind=release_notes&audience=maintainer')).toBeInTheDocument();
  });
});
