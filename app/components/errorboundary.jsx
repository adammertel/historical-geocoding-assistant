import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, info: '' };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true, info: info });

    // You can also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong.</h1>
          <div>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.info.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
