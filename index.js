const express = require('express')
const qrcode = require('qrcode-terminal')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const os = require('os')

const { execSync } = require('child_process')

const app = express()

const PORT = 3000
const HOST = '0.0.0.0'

const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  },
})

const upload = multer({ storage })

app.post('/upload', upload.array('files', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.log('⚠️  Upload attempt with no files')
    return res.status(400).json({ message: 'No files uploaded' })
  }
  res.status(200).json({
    message: 'Files uploaded successfully',
    files: req.files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
    })),
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message })
})

const getLocalIPv4 = () => {
  const platform = os.platform()
  let defaultInterface = null

  try {
    if (platform === 'win32') {
      const output = execSync(
        `powershell -Command "Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object -Property RouteMetric | Select-Object -First 1 | Select-Object -ExpandProperty InterfaceAlias"`,
        { encoding: 'utf8' }
      )
      defaultInterface = output.trim()
    } else if (platform === 'linux') {
      const output = execSync(`ip route | grep default`, { encoding: 'utf8' })
      const match = output.match(/default.* dev (\w+)/)
      if (match) defaultInterface = match[1]
    }
  } catch (err) {
    console.error('Failed to determine default network interface:', err.message)
    return { address: '127.0.0.1', _interface: 'unknown' }
  }

  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    if (name !== defaultInterface) continue
      
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return { address: iface.address, _interface: name }
      }
    }
  }

  return { address: '127.0.0.1', _interface: 'unknown' }
}

const getSSID = () => {
  try {
    const platform = os.platform()
    if (platform === 'win32') {
      const output = execSync(
        `powershell -Command "netsh wlan show interfaces | Select-String 'SSID' | Select-Object -First 1"`,
        { encoding: 'utf8' },
      )
      const match = output.match(/SSID\s*:\s*(.+)/)
      return match ? match[1].trim() : 'Unknown SSID'
    } else if (platform === 'linux') {
      const output = execSync("nmcli -t -f active,ssid dev wifi | egrep '^yes' | cut -d\\: -f2", {
        encoding: 'utf8',
      }).trim()
      return output || 'Unknown SSID'
    } else {
      return 'SSID fetch not supported on this OS'
    }
  } catch (err) {
    console.error(err)
    return 'SSID not found or unsupported platform'
  }
}

app.listen(PORT, HOST, () => {
  const { address, _interface } = getLocalIPv4()
  const ssid = getSSID()
  const url = `http://${address}:${PORT}`

  qrcode.generate(url, { small: true }, (qr) => {
    console.log('\n🔳 Scan this QR code to access the server:\n')
    console.log(qr)
  })

  console.log(`\n🌐 Server running at: ${url}`)
  console.log(`📶 Network Interface: ${_interface}`)
  console.log(`📡 SSID: ${ssid}`)
})
