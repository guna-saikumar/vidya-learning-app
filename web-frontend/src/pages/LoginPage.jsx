import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '../lib/apiClient';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './LoginPage.css';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    let isValid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Student email address is required.');
      isValid = false;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g. student@school.gov.in).');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) {
      setErrorMessage('Please enter a valid student email address and password.');
      return;
    }

    const trimmedEmail = email.trim();
    setErrorMessage(null);
    setEmailError(null);
    setPasswordError(null);
    setForgotPasswordNotice(null);
    setLoading(true);

    try {
      await login(trimmedEmail, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordNotice('Please contact your school administrator or teacher to reset your password.');
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoBox}>
            <img
              src="/assets/logo.png"
              alt="Vidya Learning"
              className={styles.logoImg}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className={styles.brandTitle}>Vidya Learning</h1>
          <div className={styles.badgePill}>
            Student Portal · AP SCERT
          </div>
        </div>

        {/* Form Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sign In</h2>
          <p className={styles.cardSubtitle}>
            Enter your student credentials to access your textbook lessons.
          </p>

          {/* Error Alert */}
          {errorMessage && (
            <div className={styles.alertError}>
              <AlertCircle size={16} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Forgot Password Notice */}
          {forgotPasswordNotice && (
            <div className={styles.alertNotice}>
              <Info size={16} />
              <div>{forgotPasswordNotice}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Student Email */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Student Email</label>
                {emailError && <span className={styles.fieldError}>{emailError}</span>}
              </div>
              <div className={`${styles.inputWrapper} ${emailError ? styles.inputWrapperError : ''}`}>
                <Mail className={styles.icon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your email (e.g. student@school.gov.in)"
                  className={styles.input}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                {passwordError && <span className={styles.fieldError}>{passwordError}</span>}
              </div>
              <div className={`${styles.inputWrapper} ${passwordError ? styles.inputWrapperError : ''}`}>
                <Lock className={styles.icon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  className={styles.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className={styles.forgotRow}>
              <button
                type="button"
                onClick={handleForgotPassword}
                className={styles.forgotLink}
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? (
                <div className={styles.spinner} />
              ) : (
                <>
                  <span>Sign In as Student</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <div className={styles.footerBox}>
          <p className={styles.footerText}>
            Student accounts are issued by the school administration. To reset your password, please contact the administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

