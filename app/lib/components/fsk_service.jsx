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
      service_mode: "primary",
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
        console.log("service: ", r);
        let service_mode = (r.service.mode) ? r.service.mode : "primary";
        console.log("service.mode: ", service_mode);
        return this$.setState({ service_mode: service_mode});
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

  _onRadioButtonClick(mode) {
    const this$ = this;
    this$.setState({
        service_mode: mode,
    });
  }

  _handleSettingDevices() {
    const this$ = this;
    return AppActions.setServiceMode(
      this$.state.service_mode,
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
    return (
      <div>
        <Card>
        <div style={ styles.content }>
          <h3>{__("Service")}</h3>
            <RadioButtonGroup name="mode" defaultSelected={ this.state.service_mode } style={{ display: 'flex', paddingTop: '20px' }} >
              <RadioButton
                value="primary"
                style={{
                  color: Colors.amber700,
                  marginBottom: 16,
                  width: '150px',
                }}
                label={__('Primary mode')}
                onTouchTap={() => this._onRadioButtonClick('primary')}/>
              <RadioButton
                  value="secondary"
                  label={__('Secondary mode')}
                  onTouchTap={() => this._onRadioButtonClick('secondary')}
                  style={{
                  color: Colors.amber700,
                  marginBottom: 16,
                  width: '170px',
                  }}/>
            </RadioButtonGroup>

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
