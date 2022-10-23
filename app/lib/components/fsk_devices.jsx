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

    this.state.devices = [];
    // this._handleSettingDevices = ::this._handleSettingDevices;
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
        console.log(r);
        let d = r.split(/\r?\n/);
        console.log(d);
        return this$.setState({ devices: d });
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
    return (
      <div>
        <Card>
        <div style={ styles.content }>
          <h3>{__("Devices")}</h3>
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
              style={{
                width: '236px',
                flexGrow: 1,
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px',
                marginLeft: '10px',
              }} />
          </div>
          <List>
            {
              this.state.devices.map(
                (value) => <ListItem primaryText={value}></ListItem>
              )
            }
          </List>
        </div>
        </Card>
      </div>
    );
  }
}

networkComponent.childContextTypes = {
  muiTheme: React.PropTypes.object,
};
