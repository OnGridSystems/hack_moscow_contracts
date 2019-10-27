# OnGrid Systems | PlasmaPay, PlasmaDLT
## About
That is a guideline how to deploy your own Node of <br>
PlasmaDLT. In my experience it is not a trivial task <br>
and I can give an arguments why it so.

#### 1. Official docs:
To link to offcial documentation: [PlasmaDLT Node Set-up Guide Mainet/ Testnet](https://developer.plasmapay.com/guides/plasma.html) <br>
Same description we can find at official github (link to github in document below) <br>
Taken from docs:
```bash
# Please go to  https://hub.docker.com/r/plasmachain/mainet
 mkdir /data
 mkdir /data/<producer name>
 mkdir /data/<produer name>/producer/conf
 # Get docker image 
 docker pull plasmachain/mainet:latest
 # Copy config files
 cp config.ini /data/<producer name>/producer/conf
 cp genesis.json /data/<producer name>/producer/conf
 # Create network
 docker network create --driver bridge <producer name>
```
There is all ok, this steps is correct.
But if dive deep, we can find some not trivial things:
Taken from docs: <br>
[!alt_text](/images/PlasmaShell.png "Docs: Step 2") <br>
*Note*: <br>
> At origin docs described at Step 2 guide says we need to use `config.json`,
> but at real node uses `config.ini`, what I will describe below.  

By help of PlasmaDLT support we are have expected a bit broken settings for file <br>
`config.ini`

```ini
# listen endpoints
bnet-endpoint = 0.0.0.0:4321
http-server-address = 0.0.0.0:8888
p2p-listen-endpoint = 0.0.0.0:9876

# validate checks
https-client-validate-peers = 1

# Can be 'any' or 'producers' or 'specified' or 'none'. If 'specified', peer-key must be specified at least once. If only 'producers', peer-key is not required. 'producers' and 'specified' may be combined. (ion::net_plugin)
# allowed-connection = any

# Optional public key of peer allowed to connect.  May be used multiple times. (ion::net_plugin)
# peer-key =


signature-provider = publickey=KEY:private_key

p2p-peer-address = agribofc.liberty.plasmadlt.com:9876
p2p-peer-address = bnpparibas.liberty.plasmadlt.com:9876
p2p-peer-address = bofamerica.liberty.plasmadlt.com:9876
p2p-peer-address = bofchina.liberty.plasmadlt.com:9876
p2p-peer-address = bsantander.liberty.plasmadlt.com:9876
p2p-peer-address = cconstructb.liberty.plasmadlt.com:9876
p2p-peer-address = citigroup.liberty.plasmadlt.com:9876
p2p-peer-address = cmerchantsb.liberty.plasmadlt.com:9876
p2p-peer-address = commonwealth.liberty.plasmadlt.com:9876
p2p-peer-address = goldmansachs.liberty.plasmadlt.com:9876
p2p-peer-address = hsbc.liberty.plasmadlt.com:9876
p2p-peer-address = indcombofc.liberty.plasmadlt.com:9876
p2p-peer-address = jpmorgan.liberty.plasmadlt.com:9876
p2p-peer-address = mitufj.liberty.plasmadlt.com:9876
p2p-peer-address = mstanley.liberty.plasmadlt.com:9876
p2p-peer-address = royalbofc.liberty.plasmadlt.com:9876
p2p-peer-address = scotiab.liberty.plasmadlt.com:9876
p2p-peer-address = tdominionb.liberty.plasmadlt.com:9876
p2p-peer-address = usbancorp.liberty.plasmadlt.com:9876
p2p-peer-address = wellsfargo.liberty.plasmadlt.com:9876
p2p-peer-address = westpac.liberty.plasmadlt.com:9876

# Plugin(s) to enable, may be specified multiple times
# plugin =

http-validate-host = 0
chain-state-db-size-mb = 16384

# Track actions which match receiver:action:actor. Actor may be blank to include all. Action and Actor both blank allows all from Recieiver. Receiver may not be blank. (ion::history_plugin)
filter-on = *

# enable-stale-production MUST BE true (unfortunately does not work without it)!
enable-stale-production = true
allowed-connection = any

# producer plugins
plugin = ion::chain_api_plugin
plugin = ion::http_plugin
plugin = ion::net_api_plugin
# plugin = ion::history_plugin
# plugin = ion::history_api_plugin
#allow all CORS hosts
access-control-allow-origin = *
```

I should not describe problems by line, but will make some notes. <br>
By first need to set custom settings for our node. <br>
```ini
# Custom settings
producer-name = ongridsyssys    # Need to set name of your wallet at PlasmaPay,
                                # it means you need to be registered. 
agent-name = ongrid             # Here is set up the name of your node,
                                # whats you can inspect later on PlasmaPay platform

allowed-connection = any        # Less secure, but we are recommend it 
                                # to easier debug of node configuration


bnet-endpoint = 0.0.0.0:4322    # Need to change port to 4322, original ini setup 4321
http-server-address = 0.0.0.0:8801  # Need to change port to 8801, some systems may use port 8888
                                    # its can cause some problems      

# The setting up a signature must be is very care
# Important this "=KEY:" signalizing node to determinate two keys PUBLIC and PRIVATE
signature-provider = PLASMA**************************************************=KEY:5JK************************************************

# These nodes of PlasmaDLT the most stable and very good to connect your node to network.
# You are can replace all addresses in origin config with these addresses.
p2p-peer-address = swisubs.liberty.plasmadlt.com:9876
p2p-peer-address = sberrus.liberty.plasmadlt.com:9876
```
Other settings for `config.ini` you dont need to change, there is all ok.

#### Next not trivial things

