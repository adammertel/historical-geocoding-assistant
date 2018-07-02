import React from 'react';

export default class Input extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      fontSize: 11
    };
  }

  render() {
    let type = this.props.type;
    if (type === 'float') type = 'tel';

    const className = this.props.info ? 'is-info' : 'is-primary';

    return (
      <div className="field">
        <div className="control">
          <input
            style={this.style()}
            className={'input ' + className}
            type={type || 'text'}
            step={this.props.type === 'float' ? 0.001 : 1}
            value={this.props.value}
            onChange={this.props.onChange}
          />
        </div>
      </div>
    );
  }
}
