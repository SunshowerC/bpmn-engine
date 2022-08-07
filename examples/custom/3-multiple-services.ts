
import {BpmnEngineExecutionApi, Engine} from 'bpmn-engine'
import { listener } from './common-listener'

// 串行多个 service 工作流:  开始 - service task1 - service task 2  - 结束 
const source = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_00791wl" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="9.3.1">
  <bpmn:process id="Process_10wqni3" isExecutable="true">
    <bpmn:startEvent id="Event_1yz7e5b" name="simple-start">
      <bpmn:outgoing>Flow_0ncueus</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_0ncueus" sourceRef="Event_1yz7e5b" targetRef="Activity_02g5s5r" />
    <bpmn:endEvent id="Event_0kqxnvk" name="simple-end">
      <bpmn:incoming>Flow_0fti1go</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:serviceTask id="Activity_02g5s5r" name="service1" implementation="\${environment.services.getCustomService()}" >
      <bpmn:incoming>Flow_0ncueus</bpmn:incoming>
      <bpmn:outgoing>Flow_1hx4x3e</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Activity_0i9xi1c" name="service2" implementation="\${environment.services.getCustomService()}">
      <bpmn:incoming>Flow_1hx4x3e</bpmn:incoming>
      <bpmn:outgoing>Flow_0fti1go</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_1hx4x3e" sourceRef="Activity_02g5s5r" targetRef="Activity_0i9xi1c" />
    <bpmn:sequenceFlow id="Flow_0fti1go" sourceRef="Activity_0i9xi1c" targetRef="Event_0kqxnvk" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10wqni3">
      <bpmndi:BPMNEdge id="Flow_0ncueus_di" bpmnElement="Flow_0ncueus">
        <di:waypoint x="198" y="120" />
        <di:waypoint x="250" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1hx4x3e_di" bpmnElement="Flow_1hx4x3e">
        <di:waypoint x="350" y="120" />
        <di:waypoint x="400" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0fti1go_di" bpmnElement="Flow_0fti1go">
        <di:waypoint x="500" y="120" />
        <di:waypoint x="582" y="120" />
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
      <bpmndi:BPMNShape id="Activity_0i9xi1c_di" bpmnElement="Activity_0i9xi1c">
        <dc:Bounds x="400" y="80" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0kqxnvk_di" bpmnElement="Event_0kqxnvk">
        <dc:Bounds x="582" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="573" y="145" width="54" height="14" />
        </bpmndi:BPMNLabel>
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
  "service1": doSomethingBiz,
  "service2": (executionContext)=>{
    const randomId = Math.random()
    return {
      randomId
    }
  },
}


const engine = Engine({
  name: 'simple-02',
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
}, ((err, execution: BpmnEngineExecutionApi) => {
  if (err) throw err;
  console.log(`response: ${execution.name}`, execution.environment.output)
}) as any)