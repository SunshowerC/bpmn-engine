
import {Engine} from 'bpmn-engine'
import { listener } from './common-listener'


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


const engine = Engine({
  name: 'simple-01',
  source,
  listener: listener,
})

engine.execute({
  variables: {
    
  }
}, (err) => {
  if (err) throw err;
})