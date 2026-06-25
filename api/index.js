module.exports = (req, res) => {
  res.json({
    status: 'online',
    message: 'UCGG License API',
    version: '2.0'
  });
};
