import {BpmnEngineExecution, BpmnEngineExecutionApi, Engine} from 'bpmn-engine'

import fs from 'fs'
import { listener } from './common-listener'

const processXml = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_00791wl" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="9.3.1">
  <bpmn:process id="Process_10wqni3" isExecutable="true">
    <bpmn:startEvent id="Event_1y26wxk" name="simple-start">
      <bpmn:outgoing>Flow_164ta0g</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Activity_022lpn2" name="usr-task-approve">
      <bpmn:incoming>Flow_164ta0g</bpmn:incoming>
      <bpmn:outgoing>Flow_1e6b3ju</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:sequenceFlow id="Flow_164ta0g" sourceRef="Event_1y26wxk" targetRef="Activity_022lpn2" />
    <bpmn:serviceTask id="Activity_13slsi1" name="svc-task" implementation="\${environment.services.getCustomService()}">
      <bpmn:incoming>Flow_1e6b3ju</bpmn:incoming>
      <bpmn:outgoing>Flow_0dvg80u</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sequenceFlow id="Flow_1e6b3ju" sourceRef="Activity_022lpn2" targetRef="Activity_13slsi1" />
    <bpmn:endEvent id="Event_1evk4f5" name="simple-end">
      <bpmn:incoming>Flow_0dvg80u</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_0dvg80u" sourceRef="Activity_13slsi1" targetRef="Event_1evk4f5" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10wqni3">
      <bpmndi:BPMNEdge id="Flow_164ta0g_di" bpmnElement="Flow_164ta0g">
        <di:waypoint x="198" y="130" />
        <di:waypoint x="250" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1e6b3ju_di" bpmnElement="Flow_1e6b3ju">
        <di:waypoint x="350" y="130" />
        <di:waypoint x="410" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0dvg80u_di" bpmnElement="Flow_0dvg80u">
        <di:waypoint x="510" y="130" />
        <di:waypoint x="572" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Event_1y26wxk_di" bpmnElement="Event_1y26wxk">
        <dc:Bounds x="162" y="112" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="152" y="155" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_022lpn2_di" bpmnElement="Activity_022lpn2">
        <dc:Bounds x="250" y="90" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_13slsi1_di" bpmnElement="Activity_13slsi1">
        <dc:Bounds x="410" y="90" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1evk4f5_di" bpmnElement="Event_1evk4f5">
        <dc:Bounds x="572" y="112" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="563" y="155" width="54" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;



 
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
    }, 60000 * 1000)
  })
}

const serviceMap = {
  "service1": doSomethingBiz,
  "service2": async (executionContext)=>{
    const randomId = Math.random()

    return new Promise((resolve, reject)=>{
      setTimeout(()=>{
        resolve({
          randomId,
        })
      }, 10000)
    })
  },
}

const engine = Engine({
  source: processXml,
  name: 'get state',
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
});


let state;
listener.once('wait', async () => {
  state = await engine.getState();
  fs.writeFileSync('./tmp/some-random-id.json', JSON.stringify(state, null, 2));
  console.log(JSON.stringify(state, null, 2));
});

listener.once('definition.start', async () => {
  state = await  engine.getState();
  fs.writeFileSync('./tmp/some-random-id.json', JSON.stringify(state, null, 2));
});

engine.execute({
  listener
}, (err) => {
  if (err) throw err;
});