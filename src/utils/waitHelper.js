function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitWithLog(ms, message = 'Esperando') {
  if (message) {
    console.log(`${message} ${ms}ms`);
  }
  return wait(ms);
}

module.exports = {
  wait,
  waitWithLog
};