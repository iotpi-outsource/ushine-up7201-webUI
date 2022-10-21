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

    this.state.devices = {
      sampling_rate: null,
      sleep_time: null,
    };
    
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
            hintText={__("Select 1, 5, 10(Hz)")}
            type="text"
            value={ this.state.devices.sampling_rate }
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
            floatingLabelText={
              <div>
                { __("Sensor sampling rate") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
          <TextField
            hintText={__("Select 0, 1, 2, 4(min)")}
            type="text"
            value={ this.state.devices.sleep_time }
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
            floatingLabelText={
              <div>
                { __("Sensor sleep time") } <b style={{ color: 'red' }}>*</b>
              </div>
            } />
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
              onTouchTap={ this._handleSettingMode }
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
