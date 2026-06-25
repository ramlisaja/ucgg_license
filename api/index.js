module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    message: 'UCGG License API',
    version: '2.0'
  });
};
