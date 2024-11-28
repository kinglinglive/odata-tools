# odata-tools
Anything to odata query.

## 使用示例

### AntdProTable
#### 使用方式
``` js
import { antdProTableToODataQueryString } from 'odata-tools';
// ProTable的request中使用
 request={async (params, sort, filter) => {
          const msg = await getUserOdata(
            antdProTableToODataQueryString(
              columns,
              params,
              sort,
              filter,
              'expand=roles(select=id,name,key)&orderby=creationTime desc',
            ),
          );
          return {
            data: msg.value,
            success: true,
            total: msg['@odata.count'],
          };
        }}
      />

```
#### 生成原理
根据column对应的valueType做处理。不存在默认为text。
``` js
// 已实现的column valueType处理：
const processingFunctions: Record<string, ProcessingFunction> = {
  text: (key, value) => `contains(${key},'${value}')`,
  select: (key, value) => `${key} eq ${value}`,
  date: (key, value) => `${key} eq ${value}`,
  dateRange: (key, value) => `${key} ge ${value[0]} and ${key} le ${value[1]}`,
};
```
#### 自定义具体列筛选
优先级大于valueType
```js
// 自定义某个column的查询，例如：
    {
      title: '自定义筛选',
      dataIndex: 'aa',
      search: true,
      valueEnum: {
        AA: { text: 'AAText' },
        BB: { text: 'BBText' },
        CC: { text: 'CCText' },
      },
      odataFilter: (key, value) => `${key} eq '${value}'`,
    },
```