const {Builder, By, Key, until} = require('selenium-webdriver');

const plz = 69123
const code = 'V572-XFJL-65PW' //'NF42-RT46-PTL5'
const song = 'party.mp3'
const timerAppReady = 60000 //timer refreshing the warteraum
const timerClicks = 5000 //timer between clicking on the page
const timerWaitForApp = 30000 
const timer10MinApp = 660000 //11min -> 660000ms, the timer is a bit off. Hence, wait more than 10 minutes


const insertCodeBtnXPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[2]/div/div/label[1]'
const inputFieldPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[1]/app-corona-vaccination-yes/form/div[1]/label/app-ets-input-code/div/div[1]/label/input'
const searchAppointmentBtn = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[1]/app-corona-vaccination-yes/form/div[2]/button'
const searchAppointmentBtnAfterErrorPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[1]/app-corona-vaccination-yes/form/div[3]/button'
const innnerTerminSuchenBtnXPath = '/html/body/app-root/div/app-page-its-search/div/div/div[2]/div/div/div[5]/div/div[1]/div[2]/div[2]/button'


function playSound(){
    const player = require('play-sound')(opts = {})
    player.play(song)
}

(async function example() {
    const driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get(`https://001-iz.impfterminservice.de/impftermine/service?plz=${plz}`)

        let bAppReady 
        let appTitle = await driver.getTitle() //"Impfterminservice - Onlinebuchung" => Warteschlange
        do {
            if (appTitle !== 'Impfterminservice - Onlinebuchung') { //116117.app => App ready
                bAppReady = true 
                await driver.sleep(timerWaitForApp) //wait to load for everything before ccontinue
            } else {
                bAppReady = false
                await driver.sleep(timerAppReady)
                appTitle = await driver.getTitle()
            }
        } while(!bAppReady)


        //get 'button' Ja - Code exists
        const insertCodeBtn = await driver.findElement(By.xpath(insertCodeBtnXPath));
        console.log('found Ja- Code exists button -> will click it now')
        insertCodeBtn.click()
        await driver.sleep(timerClicks)

        //insert the code
        const inputField = await driver.findElement(By.xpath(inputFieldPath));
        console.log('found input field for code')
        inputField.sendKeys(code)
        await driver.sleep(timerClicks)

        //click search Appointment
        const searchApntBtn = await driver.findElement(By.xpath(searchAppointmentBtn));
        searchApntBtn.click()
        await driver.sleep(timerClicks)

        // handle the unexpected error -> just click it again
        let searchPossible
        try{                           
            await driver.findElement(By.xpath(innnerTerminSuchenBtnXPath))
            searchPossible = true
        } catch(e){
            console.log('couldnt find button')
            await driver.sleep(timerWaitForApp)
        }
        if (!searchPossible){
            while (!searchPossible) {
                console.log('going into whiile')
                //click on Termin Suchen until the error remove itself
                const searchAppointmentBtnAfterError = await driver.findElement(By.xpath(searchAppointmentBtnAfterErrorPath))
                searchAppointmentBtnAfterError.click()
                await driver.sleep(timerWaitForApp)
                try{             
                    //search again              
                    await driver.findElement(By.xpath(innnerTerminSuchenBtnXPath))
                    searchPossible = true
                } catch(e){
                    await driver.sleep(timerWaitForApp)
                }

            }
        }

        //click Termin Suchen
        do {
            searchApntBtn.click() 
            try{                           
                await driver.findElement(By.xpath(innnerTerminSuchenBtnXPath))
                searchPossible = true
            } catch(e){
                // const searchAppointmentBtnAfterError = await driver.findElement(By.xpath(searchAppointmentBtnAfterErrorPath))
                // searchAppointmentBtnAfterError.click()
                await driver.sleep(timerWaitForApp)
            }
        } while (!searchPossible)
        await driver.sleep(timerWaitForApp)

        try{                            ///html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[1]/app-corona-vaccination-yes/form/div[3]/button
            driver.findElement(By.xpath(innnerTerminSuchenBtnXPath))
        } catch(e){
            const searchAppointmentBtnAfterError = await driver.findElement(By.xpath(searchAppointmentBtnAfterErrorPath))
            searchAppointmentBtnAfterError.click()
            await driver.sleep(timerWaitForApp)
        }
        

        const BtnTerminSuchenPath = '/html/body/app-root/div/app-page-its-search/div/div/div[2]/div/div/div[5]/div/div[1]/div[2]/div[2]/button'
        const terminSuchenBtn = await driver.findElement(By.xpath(BtnTerminSuchenPath))
        terminSuchenBtn.click()
        await driver.sleep(timerWaitForApp)

        const resultPath = '//*[@id="itsSearchAppointmentsModal"]/div/div/div[2]/div/div/form/div[1]/span'
        let resultText
        let resultElement
        try{
            resultElement = await driver.findElement(By.xpath(resultPath))
            resultText = await resultElement.getText()
        } catch(e){
            console.log('first try - resultText not found -> there might be an appointment available')
            playSound()
        }

        const closePopupBtnPath = '//*[@id="itsSearchAppointmentsModal"]/div/div/div[1]/button'
        const closePopupBtn = await driver.findElement(By.xpath(closePopupBtnPath))

        let bTerminMöglich
        do{
            if(resultText.includes('Derzeit stehen leider keine Termine zur Verfügung')) {
                console.log('no appointment available - I wait for 11 minutes -- ' + new Date().toLocaleTimeString())
                bTerminMöglich = false
                await driver.sleep(timer10MinApp) 
                closePopupBtn.click()
                await driver.sleep(timerClicks)
                //search again
                terminSuchenBtn.click()
                await driver.sleep(timerWaitForApp)
                try{
                    await driver.findElement(By.xpath(resultPath))
                    resultText = await resultElement.getText()
                } catch(e){
                    console.log('n try - resultText not found -> it seems there is a appointment available')
                    playSound()
                }
                
            } else {
                bTerminMöglich = true
            }
        } while (!bTerminMöglich)
        console.log('behind do-while')
        playSound()
    }
    finally{
        // driver.quit();
    }
})();

