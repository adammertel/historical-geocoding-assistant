import React from 'react';
import { observer } from 'mobx-react';
import Modal from './../bulma/modal';
import Input from './../bulma/input';
import Button from './../bulma/button';

@observer
class TablePrompt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetId: config.defaultSheetId || location.hash.substring(1)
    };
  }

  changeSheetId(e) {
    this.setState({ sheetId: e.target.value });
  }

  acceptSheetId() {
    sheetId = this.state.sheetId;
    location.hash = sheetId;
    initSheet();
  }

  render() {
    return (
      <Modal
        active={true}
        classes="is-primary"
        header="Enter id of your google sheet"
        style={{ zIndex: 1500 }}
        body={
          <Input
            value={this.state.sheetId}
            onChange={this.changeSheetId.bind(this)}
          />
        }
        footerStyle={{ textAlign: 'right', display: 'block' }}
        footer={
          <Button
            medium={true}
            onClick={this.acceptSheetId.bind(this)}
            label={'continue'}
          />
        }
      />
    );
  }
}

export default observer(TablePrompt);
