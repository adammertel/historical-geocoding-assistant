module.exports = {
  plugins: [
    require('precss'),
    require('autoprefixer')
  ],
  features: {
    customProperties: {
      preserve: true
    }
  }
}