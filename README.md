# cloudash
Like `lodash` for cloud utility functions

This utility uses several environment variables to work and expect them to be present

If you use the dotenv library you can copy the required envs from the `.env.example` file

```bash script
cp .env.example .env
```

Using the dotenv file with your Jest project
```js
module.exports = {
    setupFiles: [
        'dotenv/config'
    ],
}
```