# ctfd-puppeteer

# How to

```
$ # 1. Create users
$ export NUM_OF_USERS=100
$ export DOMAIN="xxx.yyy.com"
$ node src/register_user.js
```

```
$ # 2. Create challenges
$ export NUM_OF_CHALLS=20
$ export DOMAIN="xxx.yyy.com"
$ export LOGIN_USER="<CTFd admin username>"
$ read -s LOGIN_PASSWORD
# type CTFd admin password
$ export LOGIN_PASSWORD
$ node src/create_challs.js
```

```
$ # 3. Get challenges.json
$ # Access CTFd admin console by browser
$ # Open Settings->Export & Download exported file
$ mv db/challenges.json src/challenges.json
```

```
$ # 4. Submit flags
$ export DOMAIN="xxx.yyy.com"
$ export NUM_OF_TRIALS=100
$ export NUM_OF_USERS=100
$ export PARALLEL=10 # Puppeteer cluster's parallelism
$ export FAILURES=9 # Submission will be accepted with probability 1/(FAILURES+1)
$ node src/submit_flags.js
```
