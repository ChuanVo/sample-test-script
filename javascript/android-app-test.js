import 'babel-polyfill'
import 'colors'
import wd from 'wd'
import uploadApp from './upload-app'



const username = 'chuanvo'
const apiKey = '8b75feca-91b9-4245-9814-72eda11815f7'

// const username = process.env.KOBITON_USERNAME
// const apiKey = process.env.KOBITON_API_KEY
const deviceName = process.env.KOBITON_DEVICE_NAME || 'Galaxy*'

const kobitonServerConfig = {
  protocol: 'https',
  host: 'api-test.kobiton.com',
  auth: `${username}:${apiKey}`
}

const desiredCaps = {
  sessionName:        'Automation test session',
  sessionDescription: 'This is an example for Android app',
  deviceOrientation:  'portrait',
  captureScreenshots: true,
  deviceGroup:        'KOBITON',
  deviceName:         deviceName,
  platformName:       'Android',
  automationName: 'UiAutomator2'
}

let driver

if (!username || !apiKey) {
  console.log('Error: Environment variables KOBITON_USERNAME and KOBITON_API_KEY are required to execute script')
  process.exit(1)
}

describe('Android App sample',() => {
  before(async () => {
  
  const appId = await uploadApp(username, apiKey, process.env.BITRISE_APK_PATH)
  desiredCaps.app = `kobiton-store:${appId}`

  await new Promise((resolve) => setTimeout(resolve, 5000))


  driver = wd.promiseChainRemote(kobitonServerConfig)

  driver.on('status', (info) => {
    console.log(info.cyan)
  })
  driver.on('command', (meth, path, data) => {
    console.log(' > ' + meth.yellow, path.grey, data || '')
  })
  driver.on('http', (meth, path, data) => {
    console.log(' > ' + meth.magenta, path, (data || '').grey)
  })

  try {
    await driver.init(desiredCaps)
  }
  catch (err) {
    if (err.data) {
      console.error(`init driver: ${err.data}`)
    }
  throw err
  }


  })

  it('TestCase_Name', async () => {
    console.log("Done test!")
  })

  after(async () => {
    if (driver != null) {
    try {
      await driver.quit()
    }
    catch (err) {
      console.error(`quit driver: ${err}`)
    }
  }
  })
})
