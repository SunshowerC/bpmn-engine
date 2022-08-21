/* 
  User tasks 会触发 wait 事件，等待 signal 触发才完成流程
*/


const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');
const fs = require('fs');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <startEvent id="start" />
    <userTask id="task1" />
    <userTask id="task2" />
    <endEvent id="end" />

    <sequenceFlow id="flow1" sourceRef="start" targetRef="task1" />
    <sequenceFlow id="flow2" sourceRef="task1" targetRef="task2" />
    <sequenceFlow id="flow3" sourceRef="task" targetRef="end" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'user task example 1',
  source
});

const listener = new EventEmitter();

listener.on('wait', async (elementApi) => {
  const state = await engine.getState()
  // fs.writeFileSync('./tmp/userTask.json', JSON.stringify(state, null, 2));
  console.log('fck')
  
  // setTimeout(()=>{
  //   elementApi.signal({
  //     sirname: 'von Rosen'
  //   });
  // }, 3500)

});

listener.on('activity.end', (elementApi, engineApi) => {
  if (elementApi.content.output) engineApi.environment.output[elementApi.id] = elementApi.content.output;
});


// (async ()=>{

//   const api = await engine.execute({
//     listener
//   }, (err, execution) => {
//     if (err) throw err;
//     console.log(`User sirname is ${execution.environment.output.task.sirname}`);
//   });
  
  
//   setTimeout(()=>{
//     api.signal({
//       id:'task1',
//       // executionId:'task_833f1a2b10',
//       sirname: 'von Rosen'
//     });
//   }, 3500)


//   // await sleep(10000)
// })()




// 从数据库中恢复实例，触发下一个 userTask
(async ()=>{
  const storeState = fs.readFileSync('./tmp/userTask.json', {
    encoding: 'utf-8'
  })
  const json = JSON.parse(storeState)
  const execApi = await engine.recover(json)
  
  console.log('engine, state', )

  engine.resume({listener}, async (err, execution)=>{
    const state = await engine.getState()
    // console.log('ss', state)
  })
  setTimeout(()=>{
    engine.execution.signal({
      id: 'task2',
      data: "fuck task2"
    })
  }, 2000)
})()