# logtail
Nodejs tail a logfile for use in testscripts


Very simple example:

```
var tail = require('logtail');

tail.startListening("log", "bridge.log");

setInterval(function() {
    var data = tail.getlines();
    if(data.length)
        console.log(data);
    }, 
    1000
);
```

