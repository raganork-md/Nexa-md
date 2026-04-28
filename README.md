# Nexa-md Documentation


**Server 1**  
<a href='https://only-cathrine-menualive-c76dd2b7.koyeb.app/' target="_blank">
    <img alt='SCAN QR' src='https://img.shields.io/badge/Scan_qr-100000?style=for-the-badge&logo=scan&logoColor=white&labelColor=black&color=black'/>
</a>


## Installation
To install Nexa-md, clone the repository and install the necessary dependencies:

```bash
git clone https://github.com/raganork-md/Nexa-md.git
cd Nexa-md
npm install
```

## Configuration
You can configure Nexa-md by editing the `config.json` file. This file contains all the necessary parameters to customize your bot's behavior.

## Plugin System
Nexa-md supports a dynamic plugin system. To add a plugin:
1. Create a new JavaScript file in the `plugins` directory.
2. Export your plugin function.
3. Register your plugin in the main bot file.

## Base64 Sessions
Nexa-md uses Base64 encoding for sessions. To manage sessions:
- Encode session data using Base64 before saving it.
- Decode it when retrieving the session.

## Usage Examples
To run the bot, use the following command:

```bash
node index.js
```

### Example Configuration:
```json
{
  "session": "your_base64_encoded_session_data",
  "plugins": ["plugin1", "plugin2"]
}
```

## Contributing
We welcome contributions from the community! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them.
4. Submit a pull request.

For detailed guidelines, please refer to `CONTRIBUTING.md`. 
