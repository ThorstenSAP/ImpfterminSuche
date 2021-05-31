# Prerequisites
- Not Mac users have to ensure that selenium webdriver is able to start chrome. Hence, ownload the webdriver and include it in the path environment
- npm i

## Start scripts
node getCode.js 
node getAppointment.js

## Good to know
- ensure that the opened browser is large enough that all buttons are visible. Otherwise, selenium will not detect them
- it might happen that the timer (on the page) is 00:00 but the scripts does nothing. This happens since the timer on the page sometimes runs longer than 10 minutes