
import {EventEmitter} from 'events'
import {BpmnEngineEventApi, BpmnEngineExecutionApi} from 'bpmn-engine'
import {} from 'bpmn-elements'


const listener = new EventEmitter();
export {listener}


// engine event 
listener.on('error', (...args)=>{
  console.log('engine: error', /* args */)
})

listener.on('stop', (...args)=>{
  console.log('engine: stop', /* args */)
})

listener.on('end', (...args)=>{
  console.log('engine: end', /* args */)
})


// Events are emitted with api with execution properties
listener.on('name', (...args)=>{
  console.log('name', /* args */)
})

listener.on('state', (...args)=>{
  console.log('state', /* args */)
})

listener.on('stopped', (...args)=>{
  console.log('stopped', /* args */)
})

listener.on('environment', (...args)=>{
  console.log('environment', /* args */)
})

listener.on('definitions', (...args)=>{
  console.log('definitions', /* args */)
})

listener.on('stop', (...args)=>{
  console.log('stop', /* args */)
})

listener.on('getState', (...args)=>{
  console.log('getState', /* args */)
})

listener.on('getPostponed', (...args)=>{
  console.log('getPostponed', /* args */)
})


// Sequence flow events
listener.on('flow.take', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]
  console.log(`flow.take:${elementApi.id}, type: ${elementApi.type}`)
})

listener.on('flow.discard', (...args)=>{
  console.log('flow.discard', /* args */)
})

listener.on('flow.looped', (...args)=>{
  console.log('flow.looped', /* args */)
})



// Each activity and flow emits events when changing state.
listener.on('activity.enter', (elementApi, exection:BpmnEngineExecutionApi)=>{

  console.log(`activity.enter：name:${elementApi.name}, type: ${elementApi.type}`)
})
listener.on('activity.start', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]

  console.log(`activity.start:${elementApi.name}, type: ${elementApi.type}`)
})
listener.on('activity.wait', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]

  console.log(`activity.wait:${elementApi.name}, type: ${elementApi.type}`)
})

listener.on('activity.end', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]
  console.log(`activity.end:${elementApi.name}, type: ${elementApi.type}`)
})

listener.on('activity.leave', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]
  console.log(`activity.leave:${elementApi.name}, type: ${elementApi.type}`)
})

listener.on('activity.stop', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]
  console.log(`activity.stop:${elementApi.name}, type: ${elementApi.type}`)
})

listener.on('activity.throw', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]
  console.log(`activity.throw:${elementApi.name}, type: ${elementApi.type}`)
})

listener.on('activity.error', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]
  console.log(`activity.error:${elementApi.name}, type: ${elementApi.type}`)
})

listener.on('wait', (...args)=>{
  const [elementApi, exection] = args as [any, BpmnEngineExecutionApi]
  console.log(`wait:${elementApi.name}, type: ${elementApi.type}`)
})