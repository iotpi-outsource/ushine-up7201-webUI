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

    this.state.mqtt = {
      username: null,
      password: null,
      tx_topic: null,
      rx_topic: null,
    };
    this._handleSettingMqtt = ::this._handleSettingMqtt;
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
    AppActions.loadFskMqtt(window.session)
      .then((mqtt) => {
        return this$.setState({ mqtt: {
          username: mqtt.username,
          password: mqtt.password,
          tx_topic: mqtt.txtopic,
          rx_topic: mqtt.rxtopic,
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

  _handleSettingMqtt() {
    const this$ = this;
    return AppActions.setFskMqtt(
      this.state.mqtt.username,
      this.state.mqtt.password,
      this.state.mqtt.tx_topic,
      this.state.mqtt.rx_topic,
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
          <TextField
            type="text"
            value={ this.state.mqtt.username }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  mqtt: {
                    username: e.target.value,
                    password: this.state.mqtt.password,
                    tx_topic: this.state.mqtt.tx_topic,
                    rx_topic: this.state.mqtt.rx_topic,
                  }
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={
              <div>
                { __("username") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
          <TextField
            type="password"
            value={ this.state.mqtt.password }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  mqtt: {
                    username: this.state.mqtt.username,
                    password: e.target.value,
                    tx_topic: this.state.mqtt.tx_topic,
                    rx_topic: this.state.mqtt.rx_topic,
                  }
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={
              <div>
                { __("Password") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
          <TextField
            type="text"
            value={ this.state.mqtt.tx_topic }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  mqtt: {
                    username: this.state.mqtt.username,
                    password: this.state.mqtt.password,
                    tx_topic: e.target.value,
                    rx_topic: this.state.mqtt.rx_topic,
                  }
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={
              <div>
                { __("tx topic") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
          <TextField
            type="text"
            value={ this.state.mqtt.rx_topic }
            style={{ width: '100%' }}
            onChange={
              (e) => {
                this.setState({
                  mqtt: {
                    username: this.state.mqtt.username,
                    password: this.state.mqtt.password,
                    tx_topic: this.state.mqtt.tx_topic,
                    rx_topic: e.target.value,
                  }
                });
              }
            }
            underlineFocusStyle={{ borderColor: Colors.amber700 }}
            floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
            floatingLabelText={
              <div>
                { __("rx topic") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
        </div>
      );
    return (
      <div>
        <Card>
        <div style={ styles.content }>
          <h3>{__("MQTT")}</h3>
          { elem }
          <div style={{
                 display: 'flex',
                 flexDirection: 'row',
                 justifyContent: 'space-between',
               }}>
            <RaisedButton
              linkButton
              label={__('Cancel')}
              style={{
                width: '236px',
                flexGrow: 1,
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
                marginRight: '10px',
              }}
              backgroundColor="#EDEDED"
              labelColor="#999A94" />
            <RaisedButton
              linkButton
              secondary
              label={__('Configure & Restart')}
              backgroundColor={ Colors.amber700 }
              onTouchTap={ this._handleSettingMqtt }
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
