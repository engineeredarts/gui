import React from 'react';
import Form from '../common/forms/form';
import SelectInput from '../common/forms/selectinput';
import { isEmpty, preformatWithRequestID, deepCompare, intersection } from '../../helpers';

require('../common/prototype/Array.prototype.equals');

import AppActions from '../../actions/app-actions';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

export default class Global extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      disabled: true,
      settings: {
        id_attribute: 'Device ID'
      },
      updatedSettings: {
        id_attribute: 'Device ID'
      },
      id_attributes: [{ value: 'Device ID', label: 'Device ID' }]
    };
  }
  componentDidMount() {
    this.getSettings();
    this.getIdentityAttributes();
  }
  getSettings() {
    var self = this;
    return AppActions.getGlobalSettings()
      .then(settings => self.setState({ settings, updatedSettings: settings }))
      .catch(err => console.log(`error:${err}`));
  }
  getIdentityAttributes() {
    var self = this;
    AppActions.getDevicesByStatus()
      .then(devices => {
        if (!isEmpty(devices)) {
          var attributes = [{ value: 'Device ID', label: 'Device ID' }];
          var common1 = devices[0].identity_data;
          var common2 = {};
          // if more than 1 devices, get common keys from attributes
          if (devices.length > 1) {
            common2 = devices[1].identity_data;
            common1[intersection(common1, common2)] = intersection(common1, common2);
          }

          Object.keys(common1).forEach(x => {
            attributes.push({ value: x, label: x });
          });
          self.setState({ id_attributes: attributes });
        }
      })
      .catch(err => console.log(`error:${err}`));
  }

  changeIdAttribute(value) {
    this.setState({ updatedSettings: { id_attribute: value } });
  }

  hasChanged() {
    // compare to see if any changes were made
    var changed = this.state.updatedSettings ? !deepCompare(this.state.settings, this.state.updatedSettings) : false;
    return changed;
  }

  undoChanges() {
    var self = this;
    this.setState({ updatedSettings: self.state.settings });
    if (this.props.dialog) {
      this.props.closeDialog();
    }
  }

  saveSettings() {
    var self = this;
    return AppActions.saveGlobalSettings(self.state.updatedSettings)
      .then(() => {
        self.setState({ settings: self.state.updatedSettings });
        AppActions.setSnackbar('Settings saved successfully');
        if (self.props.dialog) {
          self.props.closeDialog();
        }
      })
      .catch(err => {
        console.log(err);
        AppActions.setSnackbar(preformatWithRequestID(err.res, `The settings couldn't be saved. ${err.res.body.error}`));
      });
  }

  render() {
    var changed = this.hasChanged();
    var id_hint = 'Choose which device identity attribute is displayed by default in the UI (this does not have any effect on the operation of the devices)';

    return (
      <div style={{ maxWidth: '750px' }} className="margin-top-small">
        {this.props.dialog ? null : (
          <div>
            <h2 style={{ marginTop: '15px' }}>Global settings</h2>
            <p className="info" style={{ marginBottom: '30px' }}>
              <FontIcon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px' }}>
                info_outline
              </FontIcon>
              These settings apply to all users, so changes made here may affect other users' experience.
            </p>
          </div>
        )}

        <Form>
          <SelectInput
            hint="Default device identity attribute"
            label="Default device identity attribute"
            id="deviceid"
            onChange={value => this.changeIdAttribute(value)}
            menuItems={this.state.id_attributes}
            style={{ width: '400px' }}
            value={this.state.updatedSettings.id_attribute}
            extraHint={id_hint}
          />
        </Form>

        <div className="margin-top-large">
          <div className="float-right">
            <FlatButton disabled={!changed && !this.props.dialog} onClick={() => this.undoChanges()} style={{ marginRight: '10px' }} label="Cancel" />
            <RaisedButton onClick={() => this.saveSettings()} disabled={!changed} primary={true} label="Save" />
          </div>
        </div>
      </div>
    );
  }
}
