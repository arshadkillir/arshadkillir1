﻿import React from "react";
import styles from './ErrorBoundary.module.css'; // Assuming you have this CSS module

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({ errorInfo: errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // In development, show the detailed error.
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className={styles.container}>
            <h2 className={styles.header}>Something went wrong.</h2>
            <pre className={styles.stackTrace}>
              {this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        );
      }
      // In production, show a user-friendly message.
      return <div className={styles.container}><h2 className={styles.header}>Oops!</h2><p className={styles.message}>Something went wrong. Please try refreshing the page.</p></div>;
    }

    return this.props.children;
  }
}
