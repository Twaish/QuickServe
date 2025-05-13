# QuickServe

A lightweight Express.js application that enables users to upload any files via a simple web interface.

Starting the server, detects your local network IP and Wi-Fi SSID, then prints a scannable QR code to access the upload page from any device on the same network.

> [!IMPORTANT]  
> Will not work if network has client-isolation enabled

## Features

- 🔄 Upload **any file type** (images, videos, documents, executables, etc.)
- 🌐 Accessible from any device on the same network
- 📡 Displays the **network interface**, **SSID**, and **IPv4 address**
- 📱 Automatically generates a **terminal QR code** to access the server
- 📁 Uploaded files are saved to a local `uploads/` directory
- 🧱 Simple, dependency-light, and cross-platform (Windows & Linux)

## Getting Started

Run the following commands:

```bash
git clone https://github.com/your-username/file-upload-server.git my-project-name
cd my-project-name
npm i
```

Then start the server by executing:

```bash
npm start
```
