import React from "react";

export default class Button extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const classes = Array.isArray(this.props.classes) ? this.props.classes : [];

    classes.push("button");

    if (this.props.size) {
      classes.push("is-" + this.props.size);
    } else {
      classes.push("is-small");
    }

    if (this.props.inverted) {
      classes.push("is-inverted");
    }

    if (this.props.color) {
      classes.push("is-" + this.props.color);
    } else {
      classes.push("is-primary");
    }

    if (this.props.tooltip) {
      classes.push("hint--top");
      classes.push("hint--small");
    }
    return (
      <a
        className={classes.join(" ")}
        onClick={!this.props.disabled ? this.props.onClick : () => {}}
        style={this.props.style}
        aria-label={this.props.tooltip}
        disabled={this.props.disabled}
      >
        {this.props.icon ? (
          <span className="icon is-small">
            <i className={"fa fa-" + this.props.icon} />
          </span>
        ) : null}
        {this.props.label ? <span>{this.props.label}</span> : null}
      </a>
    );
  }
}
