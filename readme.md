# General
Two scripts which are using the method for Webtesting. The script automatically clicks on the webpage and then checks the information which are displayed. If the information is unlike 'Es wurden keine freien Termin gefunden' it is assumed that a code or an appointment is available. As a result a sound is played.

## Prerequisites
- Not Mac users have to ensure that selenium webdriver is able to start chrome. Hence, download the webdriver and include it in the path environment
- npm i

## Start scripts
- node getCode.js => tries to get a code for an injection center
- node getAppointment.js => tries to get appointment (requires a code)

## Good to know
- ensure that the opened browser is large enough that all buttons are visible. Otherwise, selenium will not detect them
- it might happen that the timer (on the page) is 00:00 but the scripts does nothing. This happens since the timer on the page sometimes runs longer than 10 minutes