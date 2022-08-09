
// 并行多个 service task 执行完成后，才进行下一步

import {readFileSync} from 'fs'
import {BpmnEngineExecutionApi, Engine} from 'bpmn-engine'
import { listener } from './common-listener'
import { resolve } from 'path'

const source:any = readFileSync( resolve(__dirname, './bpmn/5-gateway.bpmn')) 



const doSomethingBiz = async (executionContext)=>{
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      resolve({
        data: {
          name: 'abc',
          id: 1,
          req: executionContext.environment.variables.requestBody
        },
        total: 100
      })
    }, 5000)
  })
}

const serviceMap = {
  "svc1": doSomethingBiz,
  "svc2": (executionContext)=>{
    const randomId = Math.random()

    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        resolve({
          randomId,
        })
      }, 2000)
    })
  },
  "svc3": (executionContext)=>{
    const randomId = Math.random()

    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        resolve({
          impl: 'svc3',
          randomId,
        })
      }, 10000)
    })
  },
}


const engine = Engine({
  name: '并行 service task',
  source,
  listener: listener,
  extensions: {
    // 存储每个节点的输出 存储到 environment.output['node name'] 中
    saveToEnvironmentOutput(bpmnProcess, context) {
      const environment = (context as any)?.environment


      bpmnProcess?.on('end', (api) => {
        const {name: eleName} = api.content
        environment.output[eleName || api.id] = api.content.output;
      });
    }
  }
})

engine.execute({
  variables: {
    requestBody: {
      projectId: 12
    }
  },
  services: {
    getCustomService: (defaultScope:any)=>{
      const {id, isRootScope, message, name, state, type} = defaultScope.content
      if (!(type.includes('ServiceTask'))) return;
      return async (executionContext, callback) => {
        
        const result = await serviceMap[name]?.(executionContext)
        // console.log('executing', result, defaultScope )
        // callback 可以 n 个参数
        callback(null, result);
      };
    }
  }
}, (async (err, execution: BpmnEngineExecutionApi) => {
  if (err) throw err;
  console.log('neig', engine)

  const state = await engine.getState()
  const [definition] = await engine.getDefinitions()
  
  const processes = definition?.getProcesses();
  const flows = processes?.[0]?.getSequenceFlows();
  const activities = processes?.[0]?.getActivities();
  console.log(`response: ${execution.name}`, execution.environment.output)

}) as any)