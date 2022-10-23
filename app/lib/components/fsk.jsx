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

const intervals = [{text: "50", payload: 50}, {text: "100", payload: 100}, {text: "200", payload: 200}];

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
      freq: null,
      interval: null,
      ch1_uplink_freq: null,
      ch2_uplink_freq: null,
    };

    this._handleSettingBeacon = ::this._handleSettingBeacon;
    this._handleReboot = ::this._handleReboot;
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
          freq: r.beacon.freq,
          interval: r.beacon.interval,
          ch1_uplink_freq: r.beacon.channel1,
          ch2_uplink_freq: r.beacon.channel2,
        }});
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
        return this$.refs.errorMsg.show();
      }
      alert('[' + err + '] Please try again!');
    });
  }
  _handleReboot() {
    return AppActions.reboot();
  }

  render() {
    let textType = 'password';
    let errorText = 'hello';
    let showPasswordStyle = {
      width: '100%',
      marginBottom: '44px',
    };
    let elem;
    elem = (
        <div>
          <TextField
          hintText={__('in KHZ, 902000 for 902Mhz')}
          type="text"
          value={ this.state.beacon.freq }
          style={{ width: '100%' }}
          onChange={
            (e) => {
              this.setState({
                beacon: {
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
              { __('Beacon Channel Frequency(in kHZ)') } <b style={{ color: 'red' }}>*</b>
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
            floatingLabelText={ __("Beacon TX Interval(in ms)") }
          />
          <TextField
            hintText={__("in KHZ, 902000 for 902Mhz")}
            type="text"
            value={ this.state.beacon.ch1_uplink_freq }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  beacon: {
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
                { __("Beacon uplink channel #1 frequency)") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
          <TextField
            hintText={__("in KHZ, 902000 for 902Mhz")}
            type="text"
            value={ this.state.beacon.ch2_uplink_freq }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  beacon: {
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
                { __("Beacon uplink channel #2 frequency)") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
        </div>
      );
    return (
      <div>
        <Card>
          <div style={ styles.content }>
            <h3>{__('Beacon')}</h3>
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
