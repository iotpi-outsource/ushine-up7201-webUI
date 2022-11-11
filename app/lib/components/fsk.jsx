import { default as React, PropTypes } from 'react';
import Radium from 'radium';
import mui from 'material-ui';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';
import icon7688 from '../../img/7688.png';
import icon7688Duo from '../../img/7688_duo.png';
import FskSensor from './fsk_sensor.jsx';
import FskMqtt from './fsk_mqtt.jsx';
import FskDevices from './fsk_devices.jsx';

const {
  TextField,
  Card,
  FlatButton,
  RaisedButton,
  SelectField,
  MenuItem,
  Dialog
} = mui;

const ThemeManager = new mui.Styles.ThemeManager();
const Colors = mui.Styles.Colors;
const styles = {

  content: {
    paddingRight: '128px',
    paddingLeft: '128px',
    '@media (max-width: 760px)': {
      paddingRight: '20px',
      paddingLeft: '20px',
    },
  },

};

const intervals = [{text: "50 ms", payload: '50'}, {text: "100 ms", payload: '100'}, {text: "200 ms", payload: '200'}];

@Radium
export default class networkComponent extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    successMsg: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    boardInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }

  
  constructor(props) {
    super(props);

    this.state = {
      modal: true,
      errorMsgTitle: null,
      errorMsg: null,
    };

    this.state.beacon = {
      addr: null,
      freq: null,
      interval: null,
      ch1_uplink_freq: null,
      ch2_uplink_freq: null,
    };

    this._handleSettingBeacon = ::this._handleSettingBeacon;
    this._handleReboot = ::this._handleReboot;
    this._cancelErrorMsgDialog = ::this._cancelErrorMsgDialog;
  }

  componentWillMount() {
    const this$ = this;

    ThemeManager.setComponentThemes({
      textField: {
        focusColor: Colors.amber700,
      },
      menuItem: {
        selectedTextColor: Colors.amber700,
      },
      radioButton: {
        backgroundColor: '#00a1de',
        checkedColor: '#00a1de',
      },
    });
    AppActions.loadFsk(window.session)
      .then((data) => {
        let r = data.body.result[1].values;
        // console.log(r);
        return this$.setState({ beacon: {
          // addr: this$.state.beacon.addr,
          freq: r.beacon.freq,
          interval: r.beacon.interval,
          ch1_uplink_freq: r.beacon.channel1,
          ch2_uplink_freq: r.beacon.channel2,
        }});
      });

    AppActions.loadNetInterfaceAddress("eth0", window.session)
      .then((data) => {
        let d = data.body.result[1].data.trim();
        console.log("net interface: " + d);
        return this$.setState({ beacon: {
          // addr: d.slice(6),
          freq: this$.state.beacon.freq,
          interval: this$.state.beacon.interval,
          ch1_uplink_freq: this$.state.beacon.ch1_uplink_freq,
          ch2_uplink_freq: this$.state.beacon.ch2_uplink_freq,
        }});
      })
      .catch(err => {
        console.log("load net interface: error: ", err);
      });
    
  }

  componentDidMount() {
    return true;
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme(),
    };
  }
  _handleSettingBeacon() {
    const this$ = this;
    /*if(null == this.state.beacon.addr || this.state.beacon.addr.length == 0) {
      this$.setState({
        errorMsgTitle: __('Error'),
        errorMsg: __("Gateway Addr is empty"),
      });
      return this$.refs.errorDialog.show();
    } else {
      if(!/^[0-9a-fA-F]{1,8}$/g.test(this.state.beacon.addr)) {
        this$.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Gateway Addr should be 8 hex digits"),
        });
        return this$.refs.errorDialog.show();
      } else if(/[0-9a-fA-F]{9,}/g.test(this.state.beacon.addr)) {
        this$.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Gateway Addr is too large, should be 4 bytes, or 8 hex digits"),
        });
        return this$.refs.errorDialog.show();
      }
    }*/

    if(null == this.state.beacon.freq || this.state.beacon.freq.length == 0) {
      this$.setState({
        errorMsgTitle: __('Error'),
        errorMsg: __("Beacon Channel Frequency is empty"),
      });
      return this$.refs.errorDialog.show();
    } else {
      if(!/^[0-9]+$/g.test(this.state.beacon.freq)) {
        this$.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Beacon Channel Frequency should be interger in Hz, like 902000000"),
        });
        return this$.refs.errorDialog.show();
      }
    }

    if(null == this.state.beacon.ch1_uplink_freq || this.state.beacon.ch1_uplink_freq.length == 0) {
      this$.setState({
        errorMsgTitle: __('Error'),
        errorMsg: __("Uplink Channel #1 Frequency is empty"),
      });
      return this$.refs.errorDialog.show();
    } else {
      if(!/^[0-9]+$/g.test(this.state.beacon.ch1_uplink_freq)) {
        this$.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Uplink Channel #1 Frequency should be interger in Hz, like 902000000"),
        });
        return this$.refs.errorDialog.show();
      }
    }

    if(null == this.state.beacon.ch2_uplink_freq || this.state.beacon.ch2_uplink_freq.length == 0) {
      this$.setState({
        errorMsgTitle: __('Error'),
        errorMsg: __("Uplink Channel #2 Frequency is empty"),
      });
      return this$.refs.errorDialog.show();
    } else {
      if(!/^[0-9]+$/g.test(this.state.beacon.ch2_uplink_freq)) {
        this$.setState({
          errorMsgTitle: __('Error'),
          errorMsg: __("Uplink Channel #2 Frequency should be interger in Hz, like 902000000"),
        });
        return this$.refs.errorDialog.show();
      }
    }

    return AppActions.setFskBeacon(
      this.state.beacon.freq,
      this.state.beacon.interval,
      this.state.beacon.ch1_uplink_freq,
      this.state.beacon.ch2_uplink_freq,
      window.session)
    .catch((err) => {
      if (err === 'Access denied') {
        this$.setState({
          errorMsgTitle: __('Access denied'),
          errorMsg: __('Your token was expired, please sign in again.'),
        });
        return this$.refs.errorDialog.show();
      }
      alert('[' + err + '] Please try again!');
    });
  }
  _handleReboot() {
    return AppActions.reboot(window.session);
  }

  _cancelErrorMsgDialog() {
    this.refs.errorDialog.dismiss();
  }

  render() {
    let textType = 'password';
    let errorText = 'hello';
    let showPasswordStyle = {
      width: '100%',
      marginBottom: '44px',
    };
    const errMsgActions = [
      <FlatButton
        label={__('Dismiss')}
        labelStyle={{ color: Colors.amber700 }}
        onTouchTap={ this._cancelErrorMsgDialog }
        hoverColor="none" />,
    ];

    let elem;
    elem = (
        <div>
          <Dialog
            title={ this.state.errorMsgTitle }
            actions={ errMsgActions }
            actionFocus="submit"
            ref="errorDialog"
            modal={ this.state.modal }>
            <p style={{ color: '#999A94', marginTop: '-20px' }}>{ this.state.errorMsg }</p>
          </Dialog>
          {/*<TextField
          hintText={ __('in hex format, eg, fe18, max 4 bytes / 8 hex digits') }
          type="text"
          value={ this.state.beacon.addr }
          disabled
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                beacon: {
                  addr: e.target.value,
                  freq: this.state.beacon.freq,
                  interval: this.state.beacon.interval,
                  ch1_uplink_freq: this.state.beacon.ch1_uplink_freq,
                  ch2_uplink_freq: this.state.beacon.ch2_uplink_freq,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('Gateway Addr') } <b style={{ color: 'red' }}>*</b>
            </div>
            } />*/}
          <TextField
          hintText={__('in Hz, 902000000 for 902Mhz')}
          type="text"
          value={ this.state.beacon.freq }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                beacon: {
                  addr: this.state.beacon.addr,
                  freq: e.target.value,
                  interval: this.state.beacon.interval,
                  ch1_uplink_freq: this.state.beacon.ch1_uplink_freq,
                  ch2_uplink_freq: this.state.beacon.ch2_uplink_freq,
                },
              });
            }
          }
          underlineFocusStyle={{ borderColor: Colors.amber700 }}
          floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
          floatingLabelText={
            <div>
              { __('Beacon Channel Frequency(in HZ)') } <b style={{ color: 'red' }}>*</b>
            </div>
          } />
          <SelectField
            value={ this.state.beacon.interval }
            menuItems={ intervals }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  beacon: {
                    addr: this.state.beacon.addr,
                    freq: this.state.beacon.freq,
                    interval: e.target.value,
                    ch1_uplink_freq: this.state.beacon.ch1_uplink_freq,
                    ch2_uplink_freq: this.state.beacon.ch2_uplink_freq,
                  },
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={ __("TX Interval(in ms)") }
          />
          <TextField
            hintText={__("in HZ, 902000000 for 902Mhz")}
            type="text"
            value={ this.state.beacon.ch1_uplink_freq }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  beacon: {
                    addr: this.state.beacon.addr,
                    freq: this.state.beacon.freq,
                    interval: this.state.beacon.interval,
                    ch1_uplink_freq: e.target.value,
                    ch2_uplink_freq: this.state.beacon.ch2_uplink_freq,
                  },
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={
              <div>
                { __("Uplink channel #1 frequency") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
          <TextField
            hintText={__("in HZ, 902000000 for 902Mhz")}
            type="text"
            value={ this.state.beacon.ch2_uplink_freq }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  beacon: {
                    addr: this.state.beacon.addr,
                    freq: this.state.beacon.freq,
                    interval: this.state.beacon.interval,
                    ch1_uplink_freq: this.state.beacon.ch1_uplink_freq,
                    ch2_uplink_freq: e.target.value,
                  },
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={
              <div>
                { __("Uplink channel #2 frequency") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
        </div>
      );
    return (
      <div>
        <Card>
          <div style={ styles.content }>
            <h3>{__('Channel Setting')}</h3>
            { elem }
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <RaisedButton
                linkButton
                secondary
                label={__('Save')}
                backgroundColor={ Colors.amber700 }
                onTouchTap={ this._handleSettingBeacon }
                style={{
                  width: '236px',
                  flexGrow: 1,
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '20px',
                  marginLeft: '10px',
                }} />
            </div>
          </div>
        </Card>
        <FskSensor />
        <FskDevices />
        <FskMqtt />
        <Card>
          <div style={{
                 display: 'flex',
                 flexDirection: 'row',
                 justifyContent: 'space-between',
               }}>
            <RaisedButton
              linkButton
              secondary
              label={__('Reboot')}
              backgroundColor={ Colors.amber700 }
              onTouchTap={ this._handleReboot }
              style={{
                width: '236px',
                flexGrow: 1,
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
                marginLeft: '10px',
              }} />
          </div>
        </Card>
      </div>
    );
  }
}

networkComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
