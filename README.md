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
[!alt_text](/images/PlasmaShell.png "Docs: Step 2")

