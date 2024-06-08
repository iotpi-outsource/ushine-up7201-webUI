import promise from 'bluebird';
import rpc from '../util/rpcAPI';
import AppDispatcher from '../dispatcher/appDispatcher';
let isLocalStorageNameSupported = false;

(() => {
  const testKey = 'test';
  const storage = window.sessionStorage;
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    isLocalStorageNameSupported = true;
  } catch (error) {
    window.memoryStorage = {};
    isLocalStorageNameSupported = false;
  }
})();

const appActions = {
  isLocalStorageNameSupported: isLocalStorageNameSupported,

  commitAndReboot: (session) => {
    return rpc.commitWifi(session)
    .then(() => {
      return rpc.reboot(session);
    })
    .catch(() => {
      return rpc.reboot(session);
    });
  },
  uciCommit: (config, session) => {
    return rpc.uciCommit(config, session);
  },
  loadModel: (session) => {
    return rpc.loadModel(session);
  },
  setWifi: (mode, content, session) => {
    if (mode === 'apsta') {
      return rpc.setWifi('sta', content.ssid, content.key, session)
      .then(() => {
        return rpc.setWifi('ap', content.repeaterSsid, content.repeaterKey, session);
      });
    }
    return rpc.setWifi(mode, content.ssid, content.key, session);
  },
  setWifiMode: (mode, session) => {
    let network = 'lan';
    let ignore = 1;
    let proto = 'dhcp';

    if (mode !== 'apsta') {
      network = 'wan';
      ignore = 0;
      proto = 'static';
    }

    return rpc.setWifiMode(mode, session)
    .then(() => {
      return rpc.setWifiNetworkConfig(network, session);
    })
    .then(() => {
      return rpc.uciCommit('wireless', session);
    })
    .then(() => {
      return rpc.setWifiIgnoreConfig(ignore, session);
    })
    .then(() => {
      return rpc.uciCommit('dhcp', session);
    })
    .then(() => {
      return rpc.setWifiProtoConfig(proto, session);
    })
    .then(() => {
      return rpc.uciCommit('network', session);
    });
  },
  scanWifi: (session) => {
    return rpc.scanWifi(session);
  },
  resetHostName: (hostname, session) => {
    return rpc.resetHostName(hostname, session);
  },
  resetPassword: (user, password) => {
    return rpc.resetPassword(user, password, window.session);
  },
  loadNetwork: (session) => {
    return rpc.loadNetwork(session);
  },
  loadNetstate: (session) => {
    return rpc.loadNetstate(session);
  },
  loadSystem: (session) => {
    return rpc.loadSystem(session);
  },
  initialFetchData: (session) => {
    return promise.delay(10).then(() => {
      return [
        rpc.loadSystem(session),
        rpc.loadWifi(session),
        rpc.loadNetwork(session),
        rpc.loadNetstate('lan', session),
        rpc.loadNetstate('wan', session),
      ];
    })
    .spread((system, wifi, network, lan, wan) => {
      const boardInfo = {};
      boardInfo.system = system.body.result[1].values;
      boardInfo.wifi = wifi.body.result[1].values;
      boardInfo.network = network.body.result[1].values;
      boardInfo.lan = lan.body.result[1];
      boardInfo.wan = wan.body.result[1];
      return boardInfo;
    })
    .then((boardInfo) => {
      return AppDispatcher.dispatch({
        APP_PAGE: 'CONTENT',
        boardInfo: boardInfo,
        successMsg: null,
        errorMsg: null,
      });
    });
  },

  login: function(user, password) {
    const this$ = this;
    return rpc.login(user, password)
    .then((data) => {
      const session = data.body.result[1].ubus_rpc_session;
      return session;
    })
    .then((session) => {
      window.session = session;
      if (this$.isLocalStorageNameSupported) {
        window.localStorage.info = JSON.stringify({
          user: user,
          password: password,
        });
        window.localStorage.session = session;
      } else {
        window.memoryStorage.info = JSON.stringify({
          user: user,
          password: password,
        });
        window.memoryStorage.session = session;
      }

      return rpc.grantCode(session);
    })
    .then(() => {
      return this$.initialFetchData(window.session);
    })
    .catch((err) => {
      window.session = '';

      if (this$.isLocalStorageNameSupported) {
        delete window.localStorage.session;
        delete window.localStorage.info;
      } else {
        delete window.memoryStorage.session;
        delete window.memoryStorage.info;
      }

      if (err === 'Connection failed') {
        return AppDispatcher.dispatch({
          APP_PAGE: 'LOGIN',
          successMsg: null,
          errorMsg: 'Waiting',
        });
      }

      alert(err);
    });
  },

  resetFactory: (session) => {
    return rpc.resetFactory(session);
  },

  checkFirmware: (session) => {
    return rpc.checkFirmware(session);
  },

  activeFirmware: (session) => {
    return rpc.activeFirmware(session);
  },

  uploadFirmware: (file, session) => {
    return rpc.uploadFirmware(file, session);
  },
  loadFsk: (session) => {
    return rpc.loadFsk(session);
  },
  setFskBeacon: (freq, interval, ch1, ch2, session) => {
    return rpc.setFskBeacon(freq, interval, ch1, ch2, session)
    .then(() => {
      return rpc.uciCommit('fsk', session);
    });
  },
  setFskSensor: (sampling_rate, sleep_time, session) => {
    return rpc.setFskSensor(sampling_rate, sleep_time, session)
    .then(() => {
      return rpc.uciCommit('fsk', session);
    });
  },
  loadFskMosquitto: (session) => {
    return rpc.loadFskMosquittoPasswd(session)
      .then((data)=> {
        auth = data.trim().split(':');
        return {
          username: auth[0],
          password: auth[1],
        };
      });
  },
  loadFskMqtt: (session) => {
    return promise.all([
        rpc.loadFskMosquittoPasswd(session),
        rpc.loadFskMqttUci(session),
    ]).spread((auth_data, mqtt_sect) => {
      console.log("loadFskMqtt: ", auth_data.body.result[1].data, mqtt_sect.body.result[1].values);
      let mqtt = {};

      let auth = auth_data.body.result[1].data.trim().split(':');

      mqtt.username = auth[0];
      mqtt.password = auth[1];
      mqtt.tx_topic = mqtt_sect.body.result[1].values.tx_topic;
      mqtt.rx_topic = mqtt_sect.body.result[1].values.rx_topic;
      return mqtt;
    });
  },
  /*loadFskMqtt: (session) => {
    return promise.all([
        rpc.loadFskMqtt('user', session),
        rpc.loadFskMqtt('passwd', session),
        rpc.loadFskMqtt('txpk', session),
        rpc.loadFskMqtt('rxpk', session),
    ]).spread((user, pass, tx, rx) => {
      console.log(user, pass, tx, rx);
      const mqtt = {};
      mqtt.username = user.body.result[1].data.trim();
      mqtt.password = pass.body.result[1].data.trim();
      mqtt.txtopic = tx.body.result[1].data.trim();
      mqtt.rxtopic = rx.body.result[1].data.trim();
      return mqtt;
    });
  },*/
  setFskMqtt: (user, pass, txtopic, rxtopic, session) => {
    return rpc.setFskMosquitto(user, pass, session)
      .then(() => {
        return rpc.setFskMqttUci(rxtopic, txtopic, session);
      })
      .then(() => {
        return rpc.uciCommit('fsk', session);
      });
  },
  loadFskDevices: (session) => {
    return rpc.loadFskDevices(session);
  },
  setFskDevices: (devices, session) => {
    return rpc.setFskDevices(devices, session);
  },
  reboot: (session) => {
    return rpc.reboot(session);
  },
  loadNetInterfaceAddress: (name, session) => {
    return rpc.loadNetInterfaceAddress(name, session);
  },
  reloadNetworkConfig: (session) => {
    return rpc.reloadNetworkConfig(session);
  },
  setWanNetworkStatic: (ipaddr, gateway, netmask, session) => {
    return rpc.setWanNetworkStatic(ipaddr, gateway, netmask, session);
  },
  setWanNetworkStaticDefaultRoute: (session) => {
    return rpc.setWanNetworkStaticDefaultRoute(session);
  },
  setWanDnsServer: (dns, session) => {
    console.log("set wan dns server");
    return rpc.setWanDnsServer(dns, session);
  },
  removeWanDnsServer: (session) => {
    console.log("remove wan dns server");
    return rpc.removeWanDnsServer(session);
  },
  setWanNetworkDhcp: (session) => {
    console.log("set wan network dhcp");
    return rpc.setWanNetworkDhcp(session);
  },
  getQuery: (name) => {
    let match;
    const pl = /\+/g; /* Regex for replacing addition symbol with a space */
    const search = /([^&=]+)=?([^&]*)/g;
    const query = window.location.search.substring(1);
    const decode = (s) => {
      return decodeURIComponent(s.replace(pl, ' '));
    };

    const urlParams = {};
    while (match = search.exec(query)) {
      urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams[name];
  },
  uploadDevicesList: (file, session) => {
    return rpc.uploadDevicesList(file, session);
  },
  loadTempDevicesList: (session) => {
    return rpc.loadTempDevicesList(session)
      .then((data) => {
        console.log("data: ", data);
        let list_data = data.body.result[1].data;
        console.log("temp devices list: ", list_data);
        return list_data;
      });
  },
  checkDevicesList: (data, session) => {
    let devices = data.split("\n");

    let foundIndex;
    let rgx = /^\s*[0-9a-fA-F]{8}\s*,\s*[12]\s*$/;
    let filteredDevices = [];

    // check invalid data format lines
    for(let i = 0; i < devices.length; i ++) {
      let device = devices[i].trim();
      console.log("device: ", device);
      if(device.length == 0) {
        continue;
      }
      if(!rgx.test(device)) {
        foundIndex = i;
        console.log("found device idx: ", i);
        break;
      }
      let parts = device.split(',');
      let d = {
        addr: parts[0].trim(),
        chan: parts[1].trim(),
      };
      filteredDevices.push(d);
    }
    if(foundIndex == null) {
      return [filteredDevices];
    }
    return [devices, foundIndex];
  },
  checkDuplicatedDevices: (devices, session) => {
    let mapped = {};
    for(let i = 0; i < devices.length; i ++) {
      let addr = devices[i].addr;
      if (addr in mapped) {
        return [devices, i];
      } else {
        mapped[addr] = 1;
      }
    }
    return [devices];
  },
  loadFskHttp: (session) => {
    return rpc.loadFskHttp(session).then((resp) => {
      console.log("http:", resp);
      let http = {
        url: resp.body.result[1].values.url,
      };
      return http;
    });
  },
  setFskHttp: (url, session) => {
    return rpc.setFskHttp(url, session)
      .then(() => {
        return rpc.uciCommit('fsk', session);
      });
  },
  loadUdidMap: (session) => {
    return rpc.loadUdidMap(session)
      .then((data) => {
        let udid_map = [];
        let list_data = data.body.result[1].data;
        console.log("udid map: ", list_data);
        let devices = list_data.split("\n");
        for(let i = 0; i < devices.length; i ++) {
          let device = devices[i].trim();
          if(device.length == 0) {
            continue;
          }
          let parts = device.split(',');
          let d = {
            addr: parts[0].trim(),
            udid: parts[1].trim(),
          };
          udid_map.push(d);
        }
        return udid_map;
      });
  },
  setServiceMode: (mode, session) => {
    console.log("setServiceMode:", mode);
    return rpc.setServiceMode(mode, session)
      .then(() => {
        return rpc.uciCommit('fsk', session);
      });
  },
};

export default appActions;
