/* 
script task 在 流程实例中 可以访问到 数据对象，
script task 也有一个 next 回调，调用了 next 回调确定 script task 完成。


next 回调参数为：
err: occasional error
result: optional result of the script
*/


const {Engine} = require('bpmn-engine');
const bent = require('bent');

const source = `
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <process id="theProcess" isExecutable="true">
  <startEvent id="theStart" />
  <scriptTask id="scriptTask" scriptFormat="Javascript">
    <script>
      <![CDATA[
        const self = this;
        const getJson = self.environment.services.get;
        const set = self.environment.services.set;
        getJson('https://example.com/test').then((result) => {
          self.environment.output.statusCode = 200;
          set(self, 'statusCode', 200)
          next(null, {result}); 
        }).catch((err) => {
          set(self, 'statusCode', err.statusCode);
          self.environment.output.statusCode = err.statusCode;
          next();
        });
      ]]>
    </script>
  </scriptTask>
  <endEvent id="theEnd" />

  <sequenceFlow id="flow1" sourceRef="theStart" targetRef="scriptTask" />
  <sequenceFlow id="flow2" sourceRef="scriptTask" targetRef="theEnd" />
  </process>
</definitions>`;

const engine = new Engine({
  name: 'script task example',
  source
});

engine.execute({
  variables: {
    scriptTaskCompleted: false
  },
  services: {
    get: bent('json'),
    set,
  }
});
engine.on('end', (execution) => {
  console.log('Output:', execution.environment.output);
});

function set(activity, name, value) {
  activity.logger.debug('set', name, 'to', value);
}