import React from 'react';

export default class Message extends React.Component {
  constructor(props) {
    super(props);
  }

  style() {
    return {
      fontSize: 11,
      zIndex: 1200
    };
  }

  render() {
    return (
      <article
        className={'message ' + this.props.classes}
        style={Object.assign(this.style(), this.props.style)}
      >
        {this.props.header ? (
          <div className="message-header">
            <p>{this.props.header}</p>
            {this.props.closeIcon ? (
              <button className="delete" aria-label="delete" />
            ) : null}
          </div>
        ) : null}
        <div className="message-body">{this.props.body}</div>
      </article>
    );
  }
}
