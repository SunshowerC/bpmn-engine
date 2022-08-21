import { BpmnEngineExecutionApi, Engine } from "bpmn-engine";
import { sleep } from "./common-listener";


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
    <bpmn:serviceTask id="Activity_02g5s5r" name="service1" implementation="\${environment.services.service1}" >
      <bpmn:incoming>Flow_0ncueus</bpmn:incoming>
      <bpmn:outgoing>Flow_1hx4x3e</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Activity_0i9xi1c" name="service2" implementation="\${environment.services.service2}">
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

let order = 0
const engine = Engine({
  source,
  name: 'get state',
  // listener: listener,
  extensions: {
    // 存储每个节点的输出 存储到 environment.output['node name'] 中
    saveToEnvironmentOutput(activity, context) {
      const environment = (context as any)?.environment
      
      activity?.on('start', (api) => {
        const {name: eleName, type, inbound} = api.content
        const curInputData = inbound?.reduce((inBoundResult, item) => {
          if(!environment.activityState?.[item.sourceId]?.output) {
            return inBoundResult
          }
          inBoundResult.push({
            id: item.sourceId,
            data: environment.activityState?.[item.sourceId]?.output
          })
          return inBoundResult
        }, [])

        environment.activityState = environment.activityState || {}
        environment.activityState[api.id] = {
          id: api.id,
          name: eleName,
          order: order++,
          startAt: new Date(),
          input: curInputData,
          type
          // output: api.content.output
        }

        // environment.output[eleName || api.id] = api.content.output;
      });

      activity?.on('end', (api) => {
        const {name: eleName} = api.content
        // environment.activityState[eleName || api.id] 
        // environment.output[eleName || api.id] = api.content.output;
        environment.activityState[api.id]['output'] = api.content.output?.[0]
        environment.activityState[api.id]['endAt'] = new Date()
      });
    }
  }
});


engine.execute({
  variables: {
    reqBody: {
      prjId: 776
    }
  },
  services: {
    service1: async (defaultScope:any, cb)=>{
      const {id, isRootScope, message, name, state, type} = defaultScope.content
      await sleep(3000)
      
      // 设置当前运行流程 变量，在后续的流程可访问到
      defaultScope.environment.assignVariables({
        projectEntity: 'porjzz'
      })

      cb(null, {
        call: 'service1',
        id,
        name,
        data: 'xaa'
      })
    },
    service2: async (defaultScope:any, cb)=>{
      const {id, isRootScope, message, name, state, type} = defaultScope.content
      await sleep(2000)

      defaultScope.environment.assignVariables({
        projectEntity2: 'service2'
      })


      cb(null, {
        id,
        name,
        call: 'service1',
        data: 'xaa'
      })
    }
  }
}, (async (err, execution: BpmnEngineExecutionApi) => {
  if (err) throw err;
  
  const [definition] = await engine.getDefinitions()
  const processes = definition?.getProcesses();

  const stateList = processes[0].environment.activityState
  const variable = processes[0].environment.variables

  console.log(`response: ${execution.name}`, 
  // execution.environment.output
  )
}) as any)



// setInterval(async ()=>{
  
//   const state = await engine.getState()
//   // const s2 = await engine.execution.getState()
//   // state === s2 等价

//   const [definition] = await engine.getDefinitions()
  
//   const processes = definition?.getProcesses();
//   const flows = processes?.[0]?.getSequenceFlows();
//   const activities = processes?.[0]?.getActivities();
//   const target = processes?.[0]?.getActivityById(flows[2].targetId);
//   const userTask = engine.execution.getPostponed() // 推迟执行的任务 user task
  
//   const nodeState = activities.map(item => {
//     return {
//       source: item,
//       name: item.name,
//       type: item.type, // bpmn:ServiceTask
//       id: item.id, 
//       isEnd: item.isEnd, // 是否终点
//       isStart: item.isStart, // 是否是起点
//       isRunning: item.isRunning,
//       status: item.status // executing | undefined
//     }
//   })

//   console.log('engine')

// }, 2000)