
const {Engine} = require('bpmn-engine');
const {EventEmitter} = require('events');

// const source = `
// <?xml version="1.0" encoding="UTF-8"?>
// <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
//   <process id="theProcess" isExecutable="true">
//     <dataObjectReference id="inputFromUserRef" dataObjectRef="inputFromUser" />
//     <dataObject id="inputFromUser" />
    
//     <startEvent id="theStart" />
//     <userTask id="userTask">
//       <ioSpecification id="inputSpec">
//         <dataOutput id="userInput" name="sirname" />
//       </ioSpecification>
//       <dataOutputAssociation id="associatedWith" sourceRef="userInput" targetRef="inputFromUserRef" />
//     </userTask>
//     <endEvent id="theEnd" />

//     <sequenceFlow id="flow1" sourceRef="theStart" targetRef="userTask" />
//     <sequenceFlow id="flow2" sourceRef="userTask" targetRef="theEnd" />
//   </process>
// </definitions>`;

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_00791wl" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="9.3.1">
  <bpmn:process id="Process_10wqni3" isExecutable="true">
    <bpmn:startEvent id="Event_1yz7e5b" name="simple-start">
      <bpmn:outgoing>Flow_0ncueus</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_0ncueus" sourceRef="Event_1yz7e5b" targetRef="Event_0kqxnvk" />
    <bpmn:endEvent id="Event_0kqxnvk" name="simple-end">
      <bpmn:incoming>Flow_0ncueus</bpmn:incoming>
    </bpmn:endEvent>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_10wqni3">
      <bpmndi:BPMNEdge id="Flow_0ncueus_di" bpmnElement="Flow_0ncueus">
        <di:waypoint x="198" y="120" />
        <di:waypoint x="402" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Event_1yz7e5b_di" bpmnElement="Event_1yz7e5b">
        <dc:Bounds x="162" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="152" y="145" width="57" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0kqxnvk_di" bpmnElement="Event_0kqxnvk">
        <dc:Bounds x="402" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="393" y="145" width="54" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

const engine = new Engine({
  name: 'listen example',
  source
});

const listener = new EventEmitter();

listener.once('wait', (task) => {
  task.signal({
    ioSpecification: {
      dataOutputs: [{
        id: 'userInput',
        value: 'von Rosen',
      }]
    }
  });
});

listener.on('flow.take', (flow) => {
  console.log(`flow <${flow.id}> was taken`);
});

engine.once('end', (execution) => {
  console.log(execution.environment.variables);
  console.log(`User sirname is ${execution.environment.output.data.inputFromUser}`);
});

engine.execute({
  listener
}, (err) => {
  if (err) throw err;
});