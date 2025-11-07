import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as supabaseClient from '../../utils/supabaseClient';

// Mock Supabase client
vi.mock('../../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}));

// Test component that uses the auth context
function TestComponent() {
  const { session, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('should provide initial loading state', async () => {
    const mockSubscription = { 
      unsubscribe: vi.fn(),
      id: 'mock-subscription-id',
      callback: vi.fn()
    };
    
    vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    vi.mocked(supabaseClient.supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription }
    } as any);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    
    // Wait for the async session fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('should update when session is available', async () => {
    const mockSession = {
      access_token: 'test-token',
      user: { id: 'test-user-id', email: 'test@example.com' }
    };
    
    const mockSubscription = { unsubscribe: vi.fn() };
    
    vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    } as any);
    
    vi.mocked(supabaseClient.supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription }
    } as any);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
    });
  });

  it('should handle null session', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    
    vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    } as any);
    
    vi.mocked(supabaseClient.supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription }
    } as any);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    });
  });

  it('should subscribe to auth state changes', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    const onAuthStateChangeMock = vi.fn().mockReturnValue({
      data: { subscription: mockSubscription }
    });
    
    vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    } as any);
    
    vi.mocked(supabaseClient.supabase.auth.onAuthStateChange).mockImplementation(onAuthStateChangeMock);
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(onAuthStateChangeMock).toHaveBeenCalled();
    });
  });

  it('should unsubscribe on unmount', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    
    vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    } as any);
    
    vi.mocked(supabaseClient.supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription }
    } as any);
    
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
    
    unmount();
    
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});

