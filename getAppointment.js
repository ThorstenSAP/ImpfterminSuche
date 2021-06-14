const {Builder, By, Key, until} = require('selenium-webdriver');

//Copyright (c) 2021, Thorsten Müller
/* ====== personal varibles ========*/
const plz = 69123 //plz of the impfzentrum
const code = 'abcd-eefg-2hes'
const song = 'party.mp3'

/* ====== varibles to adjust if the webpage is to slow ========*/
const timerAppReady = 60000 //timer refreshing the virtual waiting room
const timerClicks = 5000 //timer between clicking on the page
const timerWaitForApp = 30000 // time scripts waits before checking the result
const timer10MinApp = 660000 //11min -> 660000ms, the timer is a bit off. Hence, wait more than 10 minutes


const insertCodeBtnXPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[2]/div/div/label[1]'
const inputFieldPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[1]/app-corona-vaccination-yes/form/div[1]/label/app-ets-input-code/div/div[1]/label/input'
const searchAppointmentBtn = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[1]/app-corona-vaccination-yes/form/div[2]/button'
const searchAppointmentBtnAfterErrorPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[1]/app-corona-vaccination-yes/form/div[3]/button'
const innnerTerminSuchenBtnXPath = '/html/body/app-root/div/app-page-its-search/div/div/div[2]/div/div/div[5]/div/div[1]/div[2]/div[2]/button'

async function handleWaitingRoom(driver){
    let bAppReady 
    do {
        await driver.sleep(timerAppReady)
        appTitle = await driver.getTitle() //"Impfterminservice - Onlinebuchung" => Warteschlange
        if (appTitle !== 'Impfterminservice - Onlinebuchung') { //116117.app => App ready
            bAppReady = true 
        } else {
            bAppReady = false
        }
    } while (!bAppReady)
    return
}
/**
 * checks if an error element 'Unexpected error' appears after clicking the button 'search appointment'
 * If it does the script assumes it is a mistiake bei the app of the impfzentrum and tries the code over and over again
 * @param {selenium Webdriver} driver 
 */
async function handleUnexpectedError(driver){
    // handle the unexpected error
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
}

/**
 * checks if the result in the pop up (after appointment search click) is like 'Derzeit stehen leider keine Termine zur Verfügung'
 * if so it repeats the check until it differs. Then it returns
 * @param {selenium Webdriver} driver 
 */
async function validateResult(driver){
    const BtnTerminSuchenPath = '/html/body/app-root/div/app-page-its-search/div/div/div[2]/div/div/div[5]/div/div[1]/div[2]/div[2]/button'
    const resultPath = '//*[@id="itsSearchAppointmentsModal"]/div/div/div[2]/div/div/form/div[1]/span'
    const closePopupBtnPath = '//*[@id="itsSearchAppointmentsModal"]/div/div/div[1]/button'
    const terminSuchenBtn = await driver.findElement(By.xpath(BtnTerminSuchenPath))
    const closePopupBtn = await driver.findElement(By.xpath(closePopupBtnPath))
    let bTerminMöglich

    do{
        try{
            resultElement = await driver.findElement(By.xpath(resultPath))
            resultText = await resultElement.getText()
        } catch(e){
            console.log('first try - resultText not found -> there might be an appointment available')
            playSound()
        }
        if(resultText.includes('Derzeit stehen leider keine Termine zur Verfügung')) {
            console.log('no appointment available - I wait for 11 minutes -- ' + new Date().toLocaleTimeString())
            bTerminMöglich = false
            await driver.sleep(timer10MinApp) 
            await closeAndReopenPopup(driver, terminSuchenBtn, closePopupBtn)
            // try{
            //     await driver.findElement(By.xpath(resultPath))
            //     resultText = await resultElement.getText()
            // } catch(e){
            //     console.log('n try - resultText not found -> it seems there is a appointment available')
            //     playSound()
            // }
            
        } else {
            bTerminMöglich = true
        }
    } while (!bTerminMöglich)
    console.log('behind do-while')
    return
}
/**
 * 
 * @param {selenium Webdriver} driver 
 * @param {DOM element} terminSuchenBtn clickable DOM element
 * @param {DOM element} closePopupBtn clickable DOM element
 */
async function closeAndReopenPopup(driver, terminSuchenBtn, closePopupBtn){
    closePopupBtn.click()
    await driver.sleep(timerClicks)
    terminSuchenBtn.click()
    await driver.sleep(timerWaitForApp)
}
/**
 * checks if the section with the searchBtn appears and then returns
 * @param {selenium Webdriver} driver 
 * @param {DOM element} searchApntBtn 
 */
async function waitForPossibleAppointmentSearch(driver, searchApntBtn){
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
    return
}

function playSound(){
    const player = require('play-sound')(opts = {})
    player.play(song)
}

(async function main() {
    const driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get(`https://001-iz.impfterminservice.de/impftermine/service?plz=${plz}`)
        await handleWaitingRoom(driver)


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
        await handleUnexpectedError(driver)


        await waitForPossibleAppointmentSearch(driver, searchApntBtn)
        await driver.sleep(timerWaitForApp)

        //if an unexpected error occured the xpath for the appointment search will be a different than if the error did not appeared
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


        await validateResult(driver)
        playSound()
    }
    finally{
        // driver.quit();
    }
})();

