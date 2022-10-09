# <p style="text-align:center;"><font size="7">An unofficial library for fiverr</font></P>

> It's an unofficial package of fiverr.

## Installation

```bash
npm install fiverr
```
Get the fiverr user details by username

```js
const {getUser} = require('fiverr');

getUser('someUsername').then(user => {
  cosno.log(user);
}).catch(err => {
  console.error(err);
});
```

```js
import {getUser} from 'fiverr';

let user = await getUser('someUsername');
cosno.log(user);
```

## Contribution

Feel free to contribute to this project by creating an issue or submitting a PR to the github repository.