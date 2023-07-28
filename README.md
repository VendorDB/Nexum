<p align="center"><img src="https://raw.githubusercontent.com/VendorDB/Lumina/main/static/assets/logo-compact-256x256.png" alt="Logo" width="100"></p>

# VendorDB Nexum

Backend API for https://vendordb.info

## Developing

Once you've cloned the project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run start:dev
```

## Contributing

Please base your contributions off of the "canary" branch!

Main always contains the currently live version.

## Building

To create a production version of Nexum:

```bash
npm run build

npm start # start the server
```

## Configuration
Add a new file in ``config/``, either ``production.yml`` or ``development.yml``. Here you can add your config overrides.

Default values are stored in ``default.yml``

