# Fuze dashboardModules

## Installation Instructions

### Prerequisites:
- Git
- [Node/NPM](https://nodejs.org/en/download/)
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
git submodule add git@github.com:fuze/SOLENG-dashboardModules.git packages/fuze
```

### Configure the sample dashboard
To be able to use the sample dashboard that is included with this repository, the dashboard must be configured to work with your Fuze instance. Open the sample dashboard file inside of packages/fuze/dashboards that you wish to set up. In the 'config' section set the value of 'queue' and 'tenant' in 'common':
```
"common": {
       "interval" : 10000,
       "queue" : "name-of-queue",
       "tenant" : "tenant-code",
       "authName" : "portalUser"
     }
```
In the included dashboards, the "common" config is used to set configuration values for multiple widgets, however Atlasboard dashboards can be set up so that each widget has a unique configuration configured seperatly. To learn more about the structure of the dashboard configuration file structure check out the "dashboards" section of the [Atlasboard documentation](https://bitbucket.org/atlassian/atlasboard/wiki/Dashboards).

The sample dashboards use a global authentication file to segregate the login data from the configuration. Create an authentication file "globalAuth.json" in the root of the wallboard directory. The included dashboards expect an authentication key with the name 'portalUser'. Enter the Portal username and password of the user that should be used to query the APIs and your Warden App Token as shown.
```
{
  "portalUser" : {
    "username" : "PORTAL USERNAME",
    "password" : "PORTAL PASSWORD",
    "appToken" : "WardenAppToken"
  }
}
```
It is recomended to create a utility account for the wallboard to use for the requests. The user must not be SSO authenticated, and must have the following permissions:
* End-User Web Service Access
* Reports, Analytics
* Customer Health Access (Only required for some modules)

For more information about the globalAuth file see [this section](https://bitbucket.org/atlassian/atlasboard/wiki/Atlasboard%20Authentication) of the Atlasboard documentation.

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
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Average Hold Time
Shows the average hold time for a queue or group of queues. Time is displayed in seconds, or minutes and seconds (if over 60). If a threshold has been set, the background of the widget turns red if the average hold time in seconds exceeds the threshold.

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Calls Completed
Shows the number of calls that have been answered by agents in a queue or group of queues.

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Calls Waiting
Shows the number of calls that are currently waiting to be answered in a queue or group of queues.

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Logged In Number
Shows the number of agents that are currently logged into a queue or group of queues regardless of status (paused, on call, etc).

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Paused Number
Shows the number of agents who are logged into a queue or group of queues that are paused.

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Available Number
Shows the number of available (unpaused, not-on-call) agents in a queue or group of queues. If a threshold has been set, the background of the widget turns red if the number of available agents falls below the threshold.

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Member List
Shows a list of agents logged into a queue, their name, status, and number of calls taken across all queues. 

#### Associated job:
- queueStatus

#### Special User Permissions required:
- UC Health

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
tenant: customer code in Portal
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Number SLA
Shows the number of calls that met the queue or group of queue’s SLA guidelines

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Percent SLA
Shows the percent of calls in a queue or group of queue’s that meet the defined SLA guidelines. If a threshold has been set, the background of the widget turns red if the SLA percent falls below the threshold.

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Wait Time
Shows the highest current hold time for a queue or group of queues. Time is displayed in seconds, or minutes and seconds (if over 60). If widget has a threshold set, background of widget turns red when the wait time in seconds exceeds the threshold.

#### Associated job:
- queueSummary

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
threshold: Theshold for widget warning (optional)
widgetTitle: Title to display in the widget (optional)
```

### Queue Status Visual
A visual representation of availability and demand in a queue using bar charts.

#### Associated job:
- queueStatus

#### Config:
```
queue: (string or array of strings) key of the queue or queues you would like to monitor
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
widgetTitle: Title to display in the widget (optional)
```

### Queue Calls:
Displays the number of calls that have entered a queue within a given time range.

#### Associated job:
- queueData
- queueDataCombined

#### Config:
```
queue: key of the queue you would like to monitor. If none is supplied, defaults to all (optional)
tenant: customer code in Portal
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
timeRange: allowed values are 'day', 'week', 'month', '7d', or '30d'. Defaults to 'day' (optional)
widgetTitle: Title to display in the widget (optional)
```

### Queue Disposition:
Displays the number of completed queue calls that have a given disposition.

#### Associated job:
- queueData
- queueDataCombined

#### Config:
```
queue: key of the queue you would like to monitor. If none is supplied, defaults to all (optional)
tenant: customer code in Portal
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
timeRange: allowed values are 'day', 'week', 'month', '7d', or '30d'. Defaults to 'day' (optional)
variable: disposition to display. Allowed values are 'totalCalls', 'abandon', 'complete', 'exitEmpty', 'exitTimeout', 'optOut', or 'transfer'
widgetTitle: Title to display in the widget (optional)
```

### User Call Stats
A scrolling list of users and their call statistics. This widget replicates the calls by user page in the data.fuze.com frontend. This widget allows for the displayed columns to be customized.

#### Associated job:
- callData

#### Config:
```
tenant: customer code in Portal
authName: key from the globalAuthentication file of the credentials of the Portal User to be used for this request
timeRange: allowed values are 'day', 'week', 'month', '7d', or '30d'. Defaults to 'day' (optional)
department: if supplied, limits results to users in the named department (optional)
displayColumns: Array of columns to display. Allowed values are 'totalCalls', 'totalTalkTime', 'averageTalkTime', 'inbound', 'outbound', 'internal', and 'platform'.
       If no call directions are included in displayColumns, 'totalCalls', 'totalTalkTime', and 'averageTalkTime' will use all calls for this user, otherwise they will calculate the values based on the calls being displayed.
sortValue: the value to used to order the list. Allowed values are 'firstName', 'lastName', 'totalCalls', 'totalTalkTime', 'averageTalkTime', 'inbound', 'outbound', 'internal', and 'platform'
ascending: boolean that determines the direction of the sorting
pageSize: the number of results to display at once
```

### Text Widget:
A widget that displays the defined text.

#### Associated job:
- returnsNull

#### Config:
```
text: (string) Text to display
```
