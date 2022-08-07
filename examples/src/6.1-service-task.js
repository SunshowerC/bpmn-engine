'use strict';

const {Engine} = require('bpmn-engine');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
    <serviceTask id="serviceTask" name="Get" implementation="\${environment.services.getService()}" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'service task example 3',
  source
});

engine.execute({
  services: {
    getService(defaultScope) {
      if (!defaultScope.content.id === 'serviceTask') return;
      return (executionContext, callback) => {
        callback(null, executionContext.environment.variables.input);
      };
    }
  },
  variables: {
    input: 1
  },
  extensions: {
    saveToEnvironmentOutput(activity, {environment}) {
      activity.on('end', (api) => {
        environment.output[api.id] = api.content.output;
      });
    }
  }
});

engine.once('end', (execution) => {
  console.log(execution.name, execution.environment.output);
});