
import {BpmnEngineExecutionApi, Engine} from 'bpmn-engine'
import { listener } from './common-listener'

// 简单的 开始 - service task - 结束 工作流
const source = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_00791wl" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="9.3.1">
  <bpmn:process id="Process_10wqni3" isExecutable="true">
    <bpmn:startEvent id="Event_1yz7e5b" name="simple-start">
      <bpmn:outgoing>Flow_0ncueus</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:serviceTask id="Activity_02g5s5r" name="simple-service" implementation="\${environment.services.getCustomService}">
      <bpmn:incoming>Flow_0ncueus</bpmn:incoming>
      <bpmn:outgoing>Flow_0qft1bq</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_0ncueus" sourceRef="Event_1yz7e5b" targetRef="Activity_02g5s5r" />
    <bpmn:endEvent id="Event_0kqxnvk">
      <bpmn:incoming>Flow_0qft1bq</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_0qft1bq" sourceRef="Activity_02g5s5r" targetRef="Event_0kqxnvk" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10wqni3">
      <bpmndi:BPMNEdge id="Flow_0ncueus_di" bpmnElement="Flow_0ncueus">
        <di:waypoint x="198" y="120" />
        <di:waypoint x="250" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0qft1bq_di" bpmnElement="Flow_0qft1bq">
        <di:waypoint x="350" y="120" />
        <di:waypoint x="402" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Event_1yz7e5b_di" bpmnElement="Event_1yz7e5b">
        <dc:Bounds x="162" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="152" y="145" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_02g5s5r_di" bpmnElement="Activity_02g5s5r">
        <dc:Bounds x="250" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0kqxnvk_di" bpmnElement="Event_0kqxnvk">
        <dc:Bounds x="402" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`


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
  "simple-service": doSomethingBiz
}


const engine = Engine({
  name: 'simple-01',
  source,
  listener: listener,
  moddleOptions: {
    camunda: require('camunda-bpmn-moddle/resources/camunda')
  },
  extensions: {
    // 存储每个节点的输出 存储到 environment.output['node name'] 中
    saveToEnvironmentOutput(activity:any, context) {
      const environment = (context as any)?.environment

      // activity.on('end', (api: any) => {
      //   environment.output.path = environment.output.path || [];
      //   environment.output.path.push({
      //     id: api.id,
      //     name: api.name,
      //     output: api.content.output,
      //   });
      // });
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
    getCustomService: (defaultScope:any, cb)=>{
      const {id, isRootScope, message, name, state, type} = defaultScope.content

      // 方式1：implementation="\${environment.services.getCustomService()}"， 直接执行 cb 返回
      cb(null, {calResul: 98989})


      // 方式2：implementation="\${environment.services.getCustomService}"， 不执行 cb，返回一个 function 
      // if (!(type.includes('ServiceTask'))) return;
      // return async (executionContext, callback) => {
        
      //   const result = await serviceMap[name]?.(executionContext)
      //   console.log('executing', 
      //   // result, defaultScope 
      //   )
      //   callback(null, result);
      // };
    }
  }
}, ((err, execution: BpmnEngineExecutionApi) => {
  if (err) throw err;
  console.log(`response: ${execution.name}`, 
  execution.environment.output
  )
}) as any)