import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { InputField } from '../components';
import '../styles/LoginPage.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        setMessage('Account created! Please check your email to verify your account.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsSignUp(false);
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Navigate to editor on successful login
        navigate('/editor/new');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage('Password reset link sent! Please check your email.');
      setShowForgotPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background floating spheres */}
      <div className="floating-spheres">
        <div className="sphere sphere-1"></div>
        <div className="sphere sphere-2"></div>
        <div className="sphere sphere-3"></div>
        <div className="sphere sphere-4"></div>
        <div className="sphere sphere-5"></div>
        <div className="sphere sphere-6"></div>
      </div>

      {/* Main content */}
      <div className="login-content">
        <div className="login-card">
          {/* Loading spinner icon */}
          {loading && (
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
            </div>
          )}

          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">{isSignUp ? 'Sign up' : 'Log in'}</h1>
            <p className="login-subtitle">
              or{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                  setShowForgotPassword(false);
                }}
                disabled={loading}
              >
                {isSignUp ? 'log in to account' : 'create an account'}
              </button>
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="message-box error-box">
              {error}
            </div>
          )}

          {message && (
            <div className="message-box success-box">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <InputField
              type="email"
              placeholder="Email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              showPasswordToggle
            />

            {isSignUp && (
              <InputField
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                showPasswordToggle
              />
            )}

            <button
              type="submit"
              className="enter-button"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Enter'}
            </button>

            {!isSignUp && (
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  if (showForgotPassword) {
                    handleForgotPassword();
                  } else {
                    setShowForgotPassword(true);
                    setError(null);
                    setMessage(null);
                  }
                }}
                disabled={loading}
              >
                {showForgotPassword ? 'Send reset link' : 'Forgot password?'}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <div className="footer-links">
          <a href="/terms" className="footer-link">Terms of Service</a>
          <span className="footer-separator">•</span>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

