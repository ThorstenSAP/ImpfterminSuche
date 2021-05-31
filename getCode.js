const {Builder, By, Key, until} = require('selenium-webdriver');


const plz = 69123
const getCodeBtn = '/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[2]/div/div/div'


function playSound(){
    const player = require('play-sound')(opts = {})
    player.play('party.mp3')
}

(async function example() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
            // Navigate to Url
            await driver.get(`https://001-iz.impfterminservice.de/impftermine/service?plz=${plz}`);
        
            let bAppReady 
            let appTitle = await driver.getTitle() //"Impfterminservice - Onlinebuchung" => Warteschlange
            do {
                if (appTitle !== 'Impfterminservice - Onlinebuchung') { //116117.app => App ready
                    bAppReady = true 
                } else {
                    bAppReady = false
                    await driver.sleep(60000)
                    appTitle = await driver.getTitle()
                }
            }while(!bAppReady)

        //get 'button' Nein - Anspruch prüfen
        // const cheddar = await driver.wait(until.elementLocated(By.xpath(getCodeBtn)), 5000)
        const cheddar = driver.findElement(By.xpath('/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[2]/div/div/label[2]'));

        //click on the second label
        cheddar.click()

        //wait a few seconds
        await driver.sleep(15000)

        let bKeyPossible
        
        //get result element
        // const result = await driver.wait(until.elementLocated(By.xpath(getCodeBtn)), 5000)
        let result = driver.findElement(By.xpath('/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[2]/div/div/div'));
        let resultText = await result.getText()//.getAttribute('textContent')
        if (resultText.includes('Es wurden keine freien Termine in Ihrer Region gefunden. Bitte probieren Sie es später erneut.')) {
            bKeyPossible = false
        } else { 
            bKeyPossible = true
        } 

        while(!bKeyPossible){
            cheddar.click()
            await driver.sleep(15000)
            try{
                result = await driver.findElement(By.xpath('/html/body/app-root/div/app-page-its-login/div/div/div[2]/app-its-login-user/div/div/app-corona-vaccination/div[3]/div/div/div/div[2]/div/div/div'));
            } catch(e){
                playSound()
            }
            
            let resultText = await result.getText()
            if (resultText.includes('Es wurden keine freien Termine in Ihrer Region gefunden. Bitte probieren Sie es später erneut.')) {
                bKeyPossible = false
                console.log('no possible key')
            } else { 
                bKeyPossible = true
            } 
        }
        playSound()
    }
    finally{
        // driver.quit();
    }
})();

