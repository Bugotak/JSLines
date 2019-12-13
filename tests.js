const data = [1, 2, 3, 4, 5, 6];

function delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
}
  
async function delayedLog(item) {
    // мы можем использовать await для Promise
    // который возвращается из delay
    await delay();
    console.log(item);
  }
  async function processArray(array) {
    for (const item of array) {
        await delayedLog(item);
    }
    console.log('Done!');
  }
  
  processArray(data);