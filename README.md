# Fuze dashboardModules

## Installation Instructions

### Prerequisites:
- Git
- Node/NPM
### Install Atlasboard
```
#Install atlasboard:
npm install -g atlasboard

#Create a new wallboard named "mywallboard"
atlasboard new mywallboard
```
### Install Fuze Atlasboard Modules
```
#Install fuze atlasboard modules
cd mywallboard
git init
git submodule add https://github.address.for.dashboard.modules/ packages/fuze
```

Create an authentication file globalAuth.json in the root of the wallboard directory. The included dashboards expect an authentication key with the name 'portalUser'.
```
{
  "portalUser" : {
    "username" : "PORTAL USERNAME",
    "password" : "PORTAL PASSWORD"
  }
}
```

### Start Atlasboard
```
#Start the wallboard on port 8000
atlasboard start 8000
```

Browse to http://localhost:8000 to see the list of dashboards running on this wallboard.

