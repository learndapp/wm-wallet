module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production'
      ? 'https://wm-static-2.oss-cn-shanghai.aliyuncs.com/wm-wallet/'
      : '/',
};
