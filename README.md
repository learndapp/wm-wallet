# wm-wallet
A secure and fully decentralized keyless cryptocurrency wallet. Supports BTC, ETH, ERC20 Tokens. Will support others soon.


### Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lib
bitcoinjs-lib
[http://coinpunk.github.io/bitcoinjs-lib/](http://coinpunk.github.io/bitcoinjs-lib/)
```
cd public
browserify -r bitcoinjs-lib -s Bitcoin | uglifyjs > bitcoinjs.min.js
```
