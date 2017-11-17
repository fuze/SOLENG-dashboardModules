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

## Widgets included in this package
Below is a list of the existing widgets for the Atlasboard wallboard system that are included in this repository. Each widget displays different information that is updated at a given interval. These Widgets are used to create a dashboard.

### Abandoned
Shows the number of abandoned calls in a queue or group of queues for the day (same value as in TCC). If a threshold has been set, the background of the widget turns red if the number of abandoned calls exceeds the threshold.

#### Associated job:
queueStatus
queueStatusCombined

#### Config:
```
queue: key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Average Hold Time
Shows the average hold time for a queue or group of queues. Time is displayed in seconds, or minutes and seconds (if over 60). If a threshold has been set, the background of the widget turns red if the average hold time in seconds exceeds the threshold.

#### Associated job:
queueStatus
queueStatusCombined

#### Config:
```
queue: key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Calls Completed
Shows the number of calls that have been answered by agents in a queue or group of queues.

#### Associated job:
queueStatus
queueStatusCombined

#### Config:
```
queue: key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Calls Waiting
Shows the number of calls that are currently waiting to be answered in a queue or group of queues.

#### Associated job:
queueStatus
queueStatusCombined

#### Config:
```
queue: key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Logged In Number
Shows the number of agents that are currently logged into a queue or group of queues regardless of status (paused, on call, etc).

#### Associated job:
queueStatus
queueStatusCombined

#### Config:
```
queue: key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

