import { default as React, PropTypes } from 'react';
import Radium from 'radium';
import mui from 'material-ui';
import AppActions from '../actions/appActions';
import AppDispatcher from '../dispatcher/appDispatcher';

const {
  TextField,
  Card,
  FlatButton,
  RadioButtonGroup,
  RadioButton,
  RaisedButton,
  SelectField,
  Dialog,
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

const sampling_rates = [{text: "1 Hz", payload: '1'}, {text: "5 Hz", payload: '5'}, {text: "10 Hz", payload: '10'}];
const sleep_times = [{text: "0 min", payload: '0'}, {text: "1 min", payload: '1'}, {text: "2 min", payload: '2'}, {text: "4 min", payload: '4'}];

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

    this.state.devices = {
      sampling_rate: null,
      sleep_time: null,
    };
    this._handleSettingDevices = ::this._handleSettingDevices;
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
        return this$.setState({ devices: {
          sampling_rate: r.sensor.sampling_rate,
          sleep_time: r.sensor.sleep_time,
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

  _handleSettingDevices() {
    const this$ = this;
    return AppActions.setFskSensor(
      this.state.devices.sampling_rate,
      this.state.devices.sleep_time,
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
          <SelectField
            value={ this.state.devices.sampling_rate }
            menuItems={ sampling_rates }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  devices: {
                    sampling_rate: e.target.value,
                    sleep_time: this.state.devices.sleep_time,
                  }
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={ __("Sensor sampling rate") }
          />
          <SelectField
            value={ this.state.devices.sleep_time }
            menuItems={ sleep_times }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  devices: {
                    sampling_rate: this.state.devices.sampling_rate,
                    sleep_time: e.target.value,
                  }
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={ __("Sensor sleep time") }
          />
        </div>
      );
    return (
      <div>
        <Card>
        <div style={ styles.content }>
          <h3>{__("Devices")}</h3>
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
              onTouchTap={ this._handleSettingDevices }
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
      </div>
    );
  }
}

networkComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
