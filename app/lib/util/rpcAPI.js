import Promise from 'bluebird';
import request from 'superagent';
import ubusStatus from './ubusStatus';
let id = 1;
let RPCurl = '/ubus';

if (window.location.hostname === '127.0.0.1') {
  RPCurl = 'http://mylinkit.local/ubus';
}

const rpcAPI = {
  request: function(config) {
    return new Promise((resolve, reject) => {
      request
      .post(RPCurl)
      .send(config)
      .set('Accept', 'application/json')
      .end((err, res) => {
        // return res.ok ? resolve(res) : reject(err);
        if (!res) {
          console.log("reject connection failed: ", res, "err:", err);
          return reject('Connection failed');
        }

        if (!res.ok) {
          console.log("reject connection failed: ", res, "err:", err);
          return reject('Connection failed');
        }

        console.log(res.body);
        if (res.body && res.body.error) {
          console.log(res.body.error.message);
          return reject(res.body.error.message);
        }

        if (!res.body.result || res.body.result[0] !== 0) {
          console.log(ubusStatus[res.body.result[0]]);
          return reject(ubusStatus[res.body.result[0]]);
        }
        return resolve(res);
      });
    });
  },

  // ====== login start ========
  login: function(userId, password) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        '00000000000000000000000000000000',
        'session',
        'login',
        {
          username: userId,
          password: password,
        },
      ],
    };
    return this.request(config);
  },

  loadModel: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [ session, 'system', 'board', { dummy: 0 }],
    };

    return this.request(config);
  },

  grantCode: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'session',
        'grant',
        {
          scope: 'uci',
          objects: [['*', 'read'], ['*', 'write']],
        },
      ],
    };
    return this.request(config);
  },
  // ====== login end ========
  scanWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'iwinfo', 'scan', { device: 'ra0' }],
    };

    return this.request(config);
  },
  setWifiIgnoreConfig: function(ignore, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'dhcp',
          section: 'lan',
          values: {
            ignore: ignore,
          },
        },
      ],
    };
    return this.request(config);
  },
  setWifiProtoConfig: function(proto, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'lan',
          values: {
            proto: proto,
          },
        },
      ],
    };
    return this.request(config);
  },
  setWifiNetworkConfig: function(network, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: 'sta',
          values: {
            network: network,
          },
        },
      ],
    };
    return this.request(config);
  },
  setWifiMode: function(mode, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: 'radio0',
          values: {
            linkit_mode: mode,
          },
        },
      ],
    };

    return this.request(config);
  },
  setWifi: function(section, ssid, key, session) {
    let enc = 'none';
    if (key.length > 1) {
      enc = 'psk2';
    }

    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'wireless',
          section: section,
          values: {
            ssid: ssid,
            key: key,
            encryption: enc,
          },
        },
      ],
    };

    return this.request(config);
  },
  uciCommit: function(uciConfig, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'commit', {
          config: uciConfig,
        },
      ],
    };
    return this.request(config);
  },
  commitWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'apply', { commit: true }]};

    return this.request(config);
  },
  reboot: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'reboot', { dummy: 0}],
    };

    return this.request(config);
  },
  resetPassword: function(user, password, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'rpc-sys',
        'password_set',
        {
          user: user,
          password: password,
        },
      ],
    };

    return this.request(config);
  },
  loadNetstate: function(iface, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'network.interface',
        'status',
        {
          interface: iface,
        },
      ],
    };

    return this.request(config);
  },
  loadNetwork: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', { config: 'network' }],
    };

    return this.request(config);
  },
  loadSystem: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'get',
        {
          config: 'system',
          type: 'system',
        },
      ],
    };
    return this.request(config);
  },
  loadWifi: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', { config: 'wireless' }],
    };

    return this.request(config);
  },
  applyConfig: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'apply',
        { commit: true },
      ],
    };

    return this.request(config);
  },
  activeFirmware: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'upgrade_start', { keep: 1}],
    };

    return this.request(config);
  },
  checkFirmware: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'upgrade_test', { dummy: 0}],
    };

    return this.request(config);
  },
  uploadFirmware: function(file, session) {
    const uploadUrl = RPCurl.replace('/ubus', '/cgi-bin/cgi-upload');
    return new Promise((resolve, reject) => {
      request
      .post(uploadUrl)
      .field('sessionid', session)
      .field('filemode', '0600')
      .field('filename', '/tmp/firmware.bin')
      .attach('filedata', file, file.name)
      .end((err, res) => {
        // return res.ok ? resolve(res) : reject(err);
        if (!res.ok) {
          return reject('Connection failed');
        }
        return resolve(res);
      });
    });
  },

  reloadConfig: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'reload_config',
        { commit: true },
      ],
    };

    return this.request(config);
  },

  resetFactory: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'rpc-sys', 'factory', { dummy: 0}],
    };

    return this.request(config);
  },

  resetHostName: function(hostname, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set', {
          config: 'system',
          section: '@system[0]',
          values: { hostname: hostname },
        },
      ],
    };

    return this.request(config);
  },
  loadFsk: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', {
        config: 'fsk',
      }],
    };

    return this.request(config);
  },
  setFskBeacon: function(freq, interval, ch1, ch2, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'fsk',
          section: 'beacon',
          values: {
            freq: freq,
            interval: interval,
            channel1: ch1,
            channel2: ch2,
          },
        },
      ],
    };
    return this.request(config);
  },
  setFskSensor: function(sampling_rate, sleep_time, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'fsk',
          section: 'sensor',
          values: {
            sampling_rate: sampling_rate,
            sleep_time: sleep_time,
          },
        },
      ],
    };
    return this.request(config);
  },
  loadFskMqtt: function(subpath, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'read',
        {
          path: '/IoT/etc/mqtt_' + subpath,
          base64: false,
        },
      ],
    };
    return this.request(config);
  },
  setFskMqtt: function(subpath, value, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'write',
        {
          path: '/IoT/etc/mqtt_' + subpath,
          data: value + '\n',
          append: false,
          base64: false,
          mode: 0o644,
        },
      ],
    };
    return this.request(config);
  },
  loadFskMosquittoPasswd: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'read',
        {
          path: '/IoT/etc/mosquitto_passwd',
          base64: false,
        },
      ],
    };
    return this.request(config);
  },
  loadFskMqttUci: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', {
        config: 'fsk',
        section: 'mqtt',
      }],
    };

    return this.request(config);
  },
  setFskMqttUci: function(rx_topic, tx_topic, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'set', {
        config: 'fsk',
        section: 'mqtt',
        values: {
          rx_topic: rx_topic,
          tx_topic: tx_topic,
        },
      }],
    };

    return this.request(config);
  },
  setFskMosquitto: function(user, pass, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'write',
        {
          path: '/IoT/etc/mosquitto_passwd',
          data: "" + user + ":" + pass,
          append: false,
          base64: false,
          mode: 0o644,
        },
      ],
    };
    return this.request(config);
  },
  loadFile: function(path, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'read',
        {
          path: path,
          base64: false,
        },
      ],
    };
    return this.request(config);
  },
  loadFskDevices: function(session) {
    return this.loadFile('/IoT/etc/devices.txt', session);
  },
  setFskDevices: function(devices, session) {
    let data = devices.map((device) =>
      device.addr + ","/* + device.no + "," */+ device.chan
    );
    data = data.join("\n");
    console.log("save devices: ", data);
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'write',
        {
          path: '/IoT/etc/devices.txt',
          data: data + "\n",
          mode: 0o644,
          base64: false,
          append: false,
        },
      ],
    };
    return this.request(config);
  },
  loadNetInterfaceAddress: function(name, session) {
    const path = '/sys/class/net/' + name + '/address';
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'read',
        {
          path: path,
          base64: false,
        },
      ],
    };
    return this.request(config);
  },
  reloadNetworkConfig: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'network',
        'reload',
        {},
      ],
    };

    return this.request(config);
  },
  setWanNetworkStatic: function(ipaddr, gateway, netmask, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'wan',
          values: {
            proto: 'static',
            ipaddr: ipaddr,
            gateway: gateway,
            netmask: netmask,
          },
        },
      ],
    };
    return this.request(config);
  },
  setWanNetworkStaticDefaultRoute: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'network',
        'add_host_route',
        {
          target: '0.0.0.0',
          interface: 'eth0',
        },
      ],
    };
    return this.request(config);
  },
  setWanDnsServer: function(dns, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'dhcp',
          type: 'dnsmasq',
          values: {
            server: [dns],
          },
        },
      ],
    };
    return this.request(config);
  },
  removeWanDnsServer: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'delete',
        {
          config: 'dhcp',
          type: 'dnsmasq',
          options: ["server"],
        },
      ],
    };
    return this.request(config);
  },
  setWanNetworkDhcp: function(session) {
    console.log("rpc set wan network dhcp");

    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'uci',
        'set',
        {
          config: 'network',
          section: 'wan',
          values: {
            proto: 'dhcp',
            ipaddr: '',
            netmask: '',
          },
        },
      ],
    };
    return this.request(config);
  },
  uploadDevicesList: function(file, session) {
    const uploadUrl = RPCurl.replace('/ubus', '/cgi-bin/cgi-upload');
    return new Promise((resolve, reject) => {
      request
      .post(uploadUrl)
      .field('sessionid', session)
      .field('filemode', '0600')
      .field('filename', '/tmp/devices.txt')
      .attach('filedata', file, file.name)
      .end((err, res) => {
        if (!res.ok) {
          return reject('Connection failed');
        }
        return resolve(res);
      });
    });
  },
  loadTempDevicesList: function(session) {
    return this.loadFile('/tmp/devices.txt', session);
  },
  loadFskHttp: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'get', {
        config: 'fsk',
        section: 'http',
      }],
    };

    return this.request(config);
  },
  setFskHttp: function(url, session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [session, 'uci', 'set', {
        config: 'fsk',
        section: 'http',
        values: {
          url: url,
        },
      }],
    };

    return this.request(config);
  },
  loadUdidMap: function(session) {
    const config = {
      jsonrpc: '2.0',
      id: id++,
      method: 'call',
      params: [
        session,
        'file',
        'read',
        {
          path: '/tmp/udid_map.txt',
          base64: false,
        },
      ],
    };
    return this.request(config);
  },
};

export default rpcAPI;
