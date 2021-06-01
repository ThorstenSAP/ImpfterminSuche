const {Builder, By, Key, until} = require('selenium-webdriver');

//Copyright (c) 2021, Thorsten Müller
/* ====== personal varibles ========*/
const plz = 69123
const song = 'party.mp3'

/* ====== varibles to adjust if the webpage is to slow ========*/
const timerAppReady = 60000 //timer refreshing the warteraum
const timerClicks = 20000 //timer between clicking on the page
const timerResult = 300000 //time on result screen


const resultBoxXPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[2]/div/div/div'
const getCodeBtnXPath = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[2]/div/div/label[2]'


function playSound(){
    const player = require('play-sound')(opts = {})
    player.play(song)
}
async function validateResult(driver){
    console.log('in validateResult')
    let element = driver.findElement(By.xpath(resultBoxXPath))
    let resultText = await element.getText()
    console.log(resultText)
    if (resultText.includes('Es wurden keine freien Termine in Ihrer Region gefunden. Bitte probieren Sie es später erneut.')) {
        return false
    } else { 
        return true
    } 
}
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

(async function main() {
    let driver = await new Builder().forBrowser('chrome').build()
    let bKeyPossible
    try {
            // Navigate to Url
            await driver.get(`https://001-iz.impfterminservice.de/impftermine/service?plz=${plz}`);
        
            await handleWaitingRoom(driver)
            await driver.sleep(timerClicks) //wait for the app to load (eventually needed)


            //get 'button' Nein - Anspruch prüfen and click it
            const cheddar = driver.findElement(By.xpath(getCodeBtnXPath)) 
    
            do {
                cheddar.click()
                await driver.sleep(timerClicks)
                bKeyPossible = await validateResult(driver)
            } while(!bKeyPossible)

            playSound()
            await driver.sleep(timerResult)
    }
    catch(e){
    }
    finally{
        // driver.quit();
    }
})();

