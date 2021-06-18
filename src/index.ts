import { exec } from 'child_process'
import axios from 'axios'
import { BASE_URL } from '../config.json'

const PROT_SCAN_CMD = "arp -i bridge100 -a"
const MAC_ADDRESS_REGEX = /(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{1,2})/i
const INTERVAL_IN_SECOND = 10

// const MultiCastPrefix = "01:00:5E" | "1:00:5E"
// const BroadCastPrefix = "FF:FF:FF:FF:FF:FF"

const takeMacaddress = (stdout: string) => {
    // split by tab & space & new line
    const words = stdout.split(/\s/)
    console.log(words)

    let ma: string[] = []
    words.forEach((w) => {
        if (MAC_ADDRESS_REGEX.test(w)) {
            ma.push(w)
        }
    })

    console.log('first time',ma)

    return ma
}

const validPost = () => {
    const ignoreHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 22, 23]
    const currentHour = new Date().getHours()
    const pass = ignoreHours.filter((n) => n === currentHour)

    if (pass.length === 0) return true
    return false
}

const postMacaddress =  async (macAdds: string[]) => {
    const d = { anyMacaddress: macAdds }
    const postData = JSON.stringify(d)
    console.log('json data', postData)
    console.log( `${BASE_URL}/update`)

    const {status}= await axios({
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
        url: `${BASE_URL}/update`,  
        data: postData
    })
    console.log('response status',status)
    
}

const requirePostMacaddress = (macAdd: string[]) => {
    if (validPost()) {
        console.log("ok, post")
        console.log(macAdd)

        postMacaddress(macAdd)
        return
    }
    console.log("can not post macaddress")
}

const job = () => {
    exec(PROT_SCAN_CMD, (err, stdout, stderr) => {
        if (err || stderr) {
            console.log(err)
            return
        }

        const macAddress = takeMacaddress(stdout)
        requirePostMacaddress(macAddress)
    })
}

// job()

const cron = () => {
    setInterval(job, INTERVAL_IN_SECOND * 1000)
}

cron()
