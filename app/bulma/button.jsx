import React from 'react';

export default class Button extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const classes = this.props.medium
      ? 'button is-primary ' + this.props.classes
      : 'button is-small is-primary ' + this.props.classes;
    return (
      <a
        className={classes}
        onClick={this.props.onClick}
        style={this.props.style}
        aria-label={this.props.tooltip}
      >
        {this.props.icon ? (
          <span className="icon is-small">
            <i className={'fa fa-' + this.props.icon} />
          </span>
        ) : null}
        {this.props.label ? <span>{this.props.label}</span> : null}
      </a>
    );
  }
}
