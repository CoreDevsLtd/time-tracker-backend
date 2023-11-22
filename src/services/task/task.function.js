

// get seconds from meliseconds
export function getSeconds(meliseconds) {
  return parseInt(((meliseconds % 60000) / 1000).toFixed(0));
}

// get minute from seconds
export function getMinuntes(seconds) {
  return Math.floor(seconds / 60);

}
