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
![PlasmaDLT Node Set-up Guide / Step 2](https://github.com/OnGridSystems/hack_moscow_contracts/edit/master/data/pl_prod/producer/conf/PlasmaShell.png "Docs: Step 2") <br>
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


signature-provider = PUBLIC_KEY=KEY:PRIVATE_KEY

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
                           # PUBLIC KEY                           # "=KEY:" using for mark keys     # PRIVATE KEY  
signature-provider = PLASMA**************************************************=KEY:5JK************************************************

# These nodes of PlasmaDLT the most stable and very good to connect your node to network.
# You are can replace all addresses in origin config with these addresses.
p2p-peer-address = swisubs.liberty.plasmadlt.com:9876
p2p-peer-address = sberrus.liberty.plasmadlt.com:9876
```
Other settings for `config.ini` you dont need to change, there is all ok. <br>

#### Next not trivial things
The origin PlasmaDLT guide says we need to use `docker` commands to start node. <br>
We are have expected some problems in commands described in origin guide. <br>
And we have some remarks about this. <br>
1) We are think, better to use `docker-compose` and `docker-compose.yml` file <br>
   to set configurations and mapping to configure node. <br>
    - Node works fine with `genesis.json`, but here is some problems with <br>
      `config.ini`, node trying to get configurations from mappings described in origin <br>
      docs and pushed to image by `--volume` flag in `docker` command. There is all fine with <br>
      `genesis.json`, but node can not get `config.ini` from pushed volume with your <br>
      configuration. The problem hides in node. Node cant find yours `config.ini` and takes it <br>
      from node core: `/root/.local/share/ion/ionode/config/config.ini`, so we need to <br>
      set other mapping for volume, not like as origin description. You are can take a look <br>
      to snippet of `docker-compose.yml`.
```yaml
version: '3.5'

services:
  plasma_node:
    image: plasmachain/mainet:latest
    hostname: localhost
    container_name: pl_prod
    command: >
      bash -c "ionode --replay-blockchain
      --genesis-json <dir_with_your_configs>/conf/genesis.json    # Example: /pl_prod/conf/genesis.json
      --config config.ini   # There is not need to set path, 
                            # cause node cant recognize it and takes a look to core path, were it starts
      --verbose-http-errors
      --max-transaction-time=100
      --data-dir /<your_work_dir>/blockchain"   # Work dir is same, were you are put your configs. 
                                                # Directory of blockchain data/history
    volumes:
      - ./data/pl_prod/producer:/pl_prod        # We are set name as 'pl_prod' - it is a work_dir,
                                                # but parent dir is 'data', you are can set yours
      - ./data/pl_prod/producer/conf/config.ini:/root/.local/share/ion/ionode/config/config.ini   # And here we are got a solution to resolve problem with bad mapping for 'config.ini'
    restart: always   # Origin guide says - set it to 'on-failure', but we are pref set it to 'always'
    ports:
      - 8801:8888     # Settig up ports for node http API
      - 9876:9876
    networks:
      - ongridsyssys  # Set your network what described in origin docs

networks:             # Here we are invokes network to work
  ongridsyssys:
    name: ongridsyssys
    driver: bridge

```
That's all! If you have correctly setup configs and keys in `signature-provider` (config.ini) param <br>
> *Note*:
> PUBLIC and PRIVATE key you can get from your account in wallet page at [plasmapay.com](https://plasmapay.com) . 
### 2. Run node.
That is pretty simple. If you already installed the latest versions of `docker` and `docker-compose`. <br>
So you just need to run following commands:
```bash
OnGridCore@OnGridSystems:~/$ cd <work_dir>/     # Where you have put a "docker-compose.yml" file
OnGridCore@OnGridSystems:~/<work_dir>$ docker-compose up --build    # Use flag --build to be sure of your configs
```
You should see:
```bash
Creating network "ongridsyssys" with driver "bridge"
Creating pl_prod ... done
Attaching to pl_prod
pl_prod        | APPBASE: Warning: The following configuration items in the config.ini file are redundantly set to
pl_prod        |          their default value:
pl_prod        |              https-client-validate-peers, p2p-listen-endpoint, allowed-connection
pl_prod        |          Explicit values will override future changes to application defaults. Consider commenting out or
pl_prod        |          removing these items.
pl_prod        | info  2019-10-27T09:31:35.356 thread-0  chain_plugin.cpp:333          plugin_initialize    ] initializing chain plugin
pl_prod        | info  2019-10-27T09:31:35.357 thread-0  chain_plugin.cpp:512          plugin_initialize    ] Replay requested: deleting state database
pl_prod        | info  2019-10-27T09:31:35.388 thread-0  block_log.cpp:125             open                 ] Log is nonempty
pl_prod        | info  2019-10-27T09:31:35.389 thread-0  block_log.cpp:152             open                 ] Index is nonempty
pl_prod        | info  2019-10-27T09:31:35.394 thread-0  http_plugin.cpp:452           plugin_initialize    ] configured http to listen on 0.0.0.0:8801
pl_prod        | warn  2019-10-27T09:31:35.394 thread-0  net_api_plugin.cpp:96         plugin_initialize    ] 
pl_prod        | **********SECURITY WARNING**********
pl_prod        | *                                  *
pl_prod        | * --         Net API            -- *
pl_prod        | * - EXPOSED to the LOCAL NETWORK - *
pl_prod        | * - USE ONLY ON SECURE NETWORKS! - *
pl_prod        | *                                  *
pl_prod        | ************************************
pl_prod        | 
pl_prod        | warn  2019-10-27T09:31:35.394 thread-0  history_plugin.cpp:321        plugin_initialize    ] --filter-on * enabled. This can fill shared_mem, causing ionode to stop.
pl_prod        | info  2019-10-27T09:31:35.394 thread-0  http_plugin.cpp:399           operator()           ] configured http with Access-Control-Allow-Origin: *
pl_prod        | info  2019-10-27T09:31:35.395 thread-0  main.cpp:99                   main                 ] ionode version v.0.1.0-dirty
pl_prod        | info  2019-10-27T09:31:35.395 thread-0  main.cpp:100                  main                 ] ion root is /root/.local/share
pl_prod        | info  2019-10-27T09:31:35.395 thread-0  main.cpp:101                  main                 ] ionode using configuration file /root/.local/share/ion/ionode/config/config.ini
pl_prod        | info  2019-10-27T09:31:35.395 thread-0  main.cpp:102                  main                 ] ionode data directory is /pl_prod/blockchain
pl_prod        | error 2019-10-27T09:31:35.395 thread-0  controller.cpp:1735           startup              ] No head block in fork db, perhaps we need to replay
pl_prod        | warn  2019-10-27T09:31:35.396 thread-0  controller.cpp:576            initialize_fork_db   ]  Initializing new blockchain with genesis state                  
pl_prod        | info  2019-10-27T09:31:35.450 thread-0  controller.cpp:307            replay               ] existing block log, attempting to replay from 2 to 8213126 blocks
```
Then you should expect logs like:
```bash
info  2019-10-25T13:30:00.516 thread-0  producer_plugin.cpp:345       on_incoming_block    ] Received block 49085989bb2b93d4... #671293 @ 2019-10-25T13:30:00.500 signed by agribofc [trxs: 0, lib: 671255, conf: 0, latency: 16 ms]
info  2019-10-25T13:30:01.017 thread-0  producer_plugin.cpp:345       on_incoming_block    ] Received block 3816fb96c48448bd... #671294 @ 2019-10-25T13:30:01.000 signed by agribofc [trxs: 0, lib: 671255, conf: 0, latency: 17 ms]
info  2019-10-25T13:30:01.518 thread-0  producer_plugin.cpp:345       on_incoming_block    ] Received block 9601acf6bdb45269... #671295 @ 2019-10-25T13:30:01.500 signed by agribofc [trxs: 0, lib: 671255, conf: 0, latency: 18 ms]
info  2019-10-25T13:30:02.016 thread-0  producer_plugin.cpp:345       on_incoming_block    ] Received block 57eb27ea8627c695... #671296 @ 2019-10-25T13:30:02.000 signed by agribofc [trxs: 0, lib: 671255, conf: 0, latency: 16 ms]
```
If you not expected this logs, so here is a problem and node listen blockchain network. In this situation <br>
you need to contact support at [plasmapay.com](https://plasmapa.com/) or discord channel `PlasmaPay - crypto . . .` . 
