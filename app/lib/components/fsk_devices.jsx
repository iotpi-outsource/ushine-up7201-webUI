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
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
  List,
  ListItem,
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

    this.state.input = {
      addr: null,
      no: null,
      freq: null,
    };
    this.state.devices = [];
    this._handleAddDevice = ::this._handleAddDevice;
    this._handleSaveDevices = ::this._handleSaveDevices;
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
    AppActions.loadFskDevices(window.session)
      .then((data) => {
        let r = data.body.result[1].data;
        let d = r.split(/\r?\n/);
        let devices = d.filter((value) => {
          if(value.trim().length == 0) {
            return false;
          } else {
            return true;
          }
        });
        devices = devices.map((value) => {
            let i = value.split(/,/);
            return {
              addr: i[0],
              no: i[1],
              freq: i[2],
            }
        });
        console.log(devices);
        return this$.setState({ devices: devices });
    });
  }

  _handleAddDevice() {
    let device = {
      addr: this.state.input.addr,
      no: this.state.input.no,
      freq: this.state.input.freq,
    };
    let devices = this.state.devices;
    devices.push(device);
    devices.sort((d1, d2) => {
      return d1.no > d2.no;
    });
    this.setState({
      devices: devices,
    });
  }

  _handleSaveDevices() {
    let devices = this.state.devices;
    return AppActions.setFskDevices(devices, window.session);
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
    return (
      <div>
        <Card>
          <div style={ styles.content }>
          <h3>{__("Devices")}</h3>
            <TextField
              type="text"
              value={ this.state.input.addr }
              style={{ width: '100%' }}
              onChange={
                (e) => {
                  this.setState({
                    input: {
                      addr: e.target.value,
                      no: this.state.input.no,
                      freq: this.state.input.freq,
                    }
                  });
                }
              }
              underlineFocusStyle={{ borderColor: Colors.amber700 }}
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              floatingLabelText={
                <div>
                  { __("Device Address") } <b style={{ color: 'red' }}>*</b>
                </div>
              } />
            <TextField
              type="text"
              value={ this.state.input.no }
              style={{ width: '100%' }}
              onChange={
                (e) => {
                  this.setState({
                    input: {
                      addr: this.state.input.addr,
                      no: e.target.value,
                      freq: this.state.input.freq,
                    }
                  });
                }
              }
              underlineFocusStyle={{ borderColor: Colors.amber700 }}
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              floatingLabelText={
                <div>
                  { __("Device No.") } <b style={{ color: 'red' }}>*</b>
                </div>
              } />
            <TextField
              type="text"
              value={ this.state.input.freq }
              style={{ width: '100%' }}
              onChange={
                (e) => {
                  this.setState({
                    input: {
                      addr: this.state.input.addr,
                      no: this.state.input.no,
                      freq: e.target.value,
                    }
                  });
                }
              }
              underlineFocusStyle={{ borderColor: Colors.amber700 }}
              floatingLabelStyle={{ color: 'rgba(0, 0, 0, 0.498039)' }}
              floatingLabelText={
                <div>
                  { __("Device Freq.") } <b style={{ color: 'red' }}>*</b>
                </div>
              } />
            <RaisedButton
              linkButton
              secondary
              label={__('Add')}
              backgroundColor={ Colors.amber700 }
              onTouchTap={ this._handleAddDevice }
              style={{
                width: '236px',
                flexGrow: 1,
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
                marginLeft: '10px',
              }} />
          <div style={{
                 display: 'flex',
                 flexDirection: 'row',
                 justifyContent: 'space-between',
               }}>
          </div>
          <List>
            {
              this.state.devices.map(
                (device) => <ListItem primaryText={`${device.addr}, ${device.no}, ${device.freq}`}></ListItem>
              )
            }
          </List>
            <RaisedButton
              linkButton
              secondary
              label={__('Save')}
              backgroundColor={ Colors.amber700 }
              onTouchTap={ this._handleSaveDevices }
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
