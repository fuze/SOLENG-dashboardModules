# Fuze dashboardModules

## Installation instructions

### Prerequisites:
- Git
- Node/NPM

```
#Install atlasboard:
npm install -g atlasboard

#Create a new wallboard named "mywallboard"
atlasboard new mywallboard

#Install fuze atlasboard modules
cd mywallboard
git init
git submodule add https://github.address.for.dashboard.modules/ packages/fuze

#Start the wallboard on port 8000
atlasboard start 8000

#Browse to http://localhost:8000 to see the list of dashboards running on this wallboard.
```
